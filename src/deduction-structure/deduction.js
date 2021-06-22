import stampit from '@stamp/it'
import { Base } from '../utils'
import { Rule } from './rule'
import { RegularRuleApplicationSummary, Step, TheoremRuleApplicationSummary } from './step'
import { TermDependencyGraph } from './term-dependency-graph'
import _ from 'lodash'

// Structure containing all relevant information about some deduction (proof) carried out as a
// sequence of steps.
export const Deduction = stampit({
  name: 'Deduction',
  init ({
    // Sequence of steps.
    steps = [],
    // Graph containing information about dependencies between terms.
    termDependencyGraph = TermDependencyGraph()
  }) {
    this.steps = steps
    this.termDependencyGraph = termDependencyGraph
  },
  methods: {
    isFinished () {
      if (this.getSize() === 0) return false

      const { assumptions } = this.getLastStep()

      return _.isEmpty(assumptions)
    },

    getSize () { return this.steps.length },

    // Gets step by its ordinal number. From regular user's perspective steps are referenced by
    // positive integers (ordinal numbers) starting from 1. Internally, zero-based indexes are used.
    getStepByOrdinal (ordinal) { return this.getStep(ordinal - 1) },

    // Gets step by index or throws if there's no such step.
    getStep (stepIndex) {
      const step = this.steps[stepIndex]
      if (step === undefined) throw new Error(`no step at index ${stepIndex}`)
      return step
    },

    // Gets all symbols appearing in deduction (free or not).
    getSyms () {
      const syms = {}
      this.steps.forEach(step => { Object.assign(syms, step.formula.getSyms()) })
      return syms
    },

    getLastStep () {
      const step = this.steps[this.steps.length - 1]
      if (step === undefined) throw new Error('no last step')
      return step
    },

    // Derives new deduction by applying rule specified by `ruleApplicationSpec`.
    applyRule (ruleApplicationSpec) {
      return ruleApplicationSpec.rule === Rule.Theorem
        ? this._applyTheoremRule(ruleApplicationSpec)
        : this._applyRegularRule(ruleApplicationSpec)
    },

    _applyTheoremRule ({
      theorem: formula,
      theoremId
    }) {
      const ruleApplicationSummary = TheoremRuleApplicationSummary({ theoremId })
      const step = Step({
        formula,
        ruleApplicationSummary
      })
      return this._addStep(step)
    },

    _applyRegularRule ({
      rule,
      premises,
      conclusion,
      termDependencies,
      assumptionToRemove
    }) {
      const assumptions = this._calculateAssumptions(premises, [assumptionToRemove])

      let graph = this.termDependencyGraph
      let removedTermDependencies
      if (termDependencies !== undefined) {
        ([graph, removedTermDependencies] = this._updateGraph(termDependencies))
      }

      const ruleApplicationSummary = RegularRuleApplicationSummary({
        rule,
        premises,
        addedTermDependencies: termDependencies,
        removedTermDependencies
      })

      const step = Step({
        assumptions,
        formula: conclusion,
        ruleApplicationSummary
      })

      return this._addStep(step)._setGraph(graph)
    },

    // Calculates new graph according to changes required by the rule's term dependencies. Also
    // creates a second graph which contains removed term dependencies. Returns both graphs as a
    // result.
    _updateGraph (termDependencies) {
      const {
        dependent,
        dependencies
      } = termDependencies

      const removedTermDependencies = TermDependencyGraph()

      const graph = this.termDependencyGraph.addDependencies(
        dependent,
        [...dependencies],
        (dependentTerm, dependencyTerm) => {
          let dependencyTerms = removedTermDependencies.getDirectDependencies(dependentTerm)
          if (dependencyTerms === undefined) {
            dependencyTerms = new Set()
            removedTermDependencies.setDirectDependencies(dependentTerm, dependencyTerms)
          }
          dependencyTerms.add(dependencyTerm)
        }
      )

      return [graph, removedTermDependencies]
    },

    _setGraph (termDependencyGraph) {
      return this.clone({ termDependencyGraph })
    },

    _addStep (step) {
      return this.clone({ steps: [...this.steps, step] })
    },

    // Calculates which assumptions must be added to the next step according to the specified rule's
    // premises. Assumptions are inherited from all premises of the rule. In addition to that if the
    // premise was introduced by `Premise` or `Theorem` rule, its index is also added as an
    // assumption.
    _calculateAssumptions (premises, toRemove) {
      const result = new Set()

      premises.forEach(premise => {
        const step = this.getStep(premise)

        const {
          assumptions,
          ruleApplicationSummary: { rule }
        } = step

        if (rule === Rule.Premise || rule === Rule.Theorem) {
          result.add(premise)
        }

        assumptions.forEach(assumption => { result.add(assumption) })
      })

      if (toRemove !== undefined) {
        toRemove.forEach(assumption => { result.delete(assumption) })
      }

      return result
    }
  }
}).compose(Base)
