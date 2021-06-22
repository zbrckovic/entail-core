import { Rule } from '../../deduction-structure'
import { createError, ErrorName } from '../../error'
import {
  conditional,
  conjunction,
  disjunction,
  biconditional,
  existentialQuantifier,
  universalQuantifier
} from '../../primitive-syms'
import {
  isConditionalFrom,
  isConditionalTo,
  isDoubleNegation,
  isNegationOf
} from '../../propositional-logic/propositional-logic-util'
import { isDeepEqual } from '../../utils'
import { BiconditionalEliminationRuleInterface } from './biconditional-elimination-rule-interface'
import { BiconditionalIntroductionRuleInterface } from './biconditional-introduction-rule-interface'
import { ConditionalEliminationRuleInterface } from './conditional-elimination-rule-interface'
import { ConjunctionEliminationRuleInterface } from './conjunction-elimination-rule-interface'
import { ConjunctionIntroductionRuleInterface } from './conjunction-introduction-rule-interface'
import { ConditionalIntroductionRuleInterface } from './conditional-introduction-rule-interface'
import { DisjunctionEliminationRuleInterface } from './disjunction-elimination-rule-interface'
import { DisjunctionIntroductionRuleInterface } from './disjunction-introduction-rule-interface'
import { NegationEliminationRuleInterface } from './negation-elimination-rule-interface'
import { NegationIntroductionRuleInterface } from './negation-introduction-rule-interface'
import { PremiseRuleInterface } from './premise-rule-interface'
import {
  ExistentialGeneralizationRuleInterface,
  ExistentialInstantiationRuleInterface,
  UniversalGeneralizationRuleInterface,
  UniversalInstantiationRuleInterface
} from './quantification'
import { TautologicalImplicationRuleInterface } from './tautological-implication-rule-interface'
import { TheoremRuleInterface } from './theorem-rule-interface'
import { ExplosionRuleInterface } from './explosion-rule-interface'
import { RepetitionRuleInterface } from './repetition-rule-interface'

// Accepts deduction and selected steps (step indexes), returns interface for choosing rule.
export const RulesInterface = (deduction, ...steps) => {
  const handlers = {
    [Rule.Premise]: () => {
      if (steps.length !== 0) return undefined

      return PremiseRuleInterface({ deduction })
    },
    [Rule.ConditionalIntroduction]: () => {
      if (steps.length !== 2) return undefined

      const [step1Index, step2Index] = steps
      const [step1, step2] = steps.map(i => deduction.getStep(i))

      const step1IsPremise = step1.ruleApplicationSummary.rule === Rule.Premise
      const step1IsAssumptionForStep2 = step2.assumptions.has(step1Index)

      if (!(step1IsPremise && step1IsAssumptionForStep2)) return undefined

      return ConditionalIntroductionRuleInterface({ deduction, step1Index, step2Index })
    },
    [Rule.TautologicalImplication]: () => TautologicalImplicationRuleInterface({
      deduction,
      stepIndexes: steps
    }),
    [Rule.UniversalInstantiation]: () => {
      if (steps.length !== 1) return undefined

      const [step] = steps
      const universallyQuantifiedFormula = deduction.getStep(step).formula
      if (!universallyQuantifiedFormula.sym.equals(universalQuantifier)) return undefined

      return UniversalInstantiationRuleInterface({ deduction, stepIndex: step })
    },
    [Rule.UniversalGeneralization]: () => {
      if (steps.length !== 1) return undefined

      const [step] = steps

      return UniversalGeneralizationRuleInterface({ deduction, stepIndex: step })
    },
    [Rule.ExistentialInstantiation]: () => {
      if (steps.length !== 1) return undefined

      const [step] = steps
      const existentiallyQuantifiedFormula = deduction.getStep(step).formula
      if (!existentiallyQuantifiedFormula.sym.equals(existentialQuantifier)) return undefined

      return ExistentialInstantiationRuleInterface({ deduction, stepIndex: step })
    },
    [Rule.ExistentialGeneralization]: () => {
      if (steps.length !== 1) return undefined

      const [step] = steps

      return ExistentialGeneralizationRuleInterface({ deduction, stepIndex: step })
    },
    [Rule.Theorem]: () => {
      if (steps.length !== 0) return undefined

      return TheoremRuleInterface({ deduction })
    },
    [Rule.NegationIntroduction]: () => {
      if (steps.length !== 3) return undefined

      const [
        premiseStepIndex,
        conclusion1StepIndex,
        conclusion2StepIndex
      ] = steps

      const [
        premiseStep,
        conclusion1Step,
        conclusion2Step
      ] = steps.map(stepIndex => deduction.getStep(stepIndex))

      if (premiseStep.ruleApplicationSummary.rule !== Rule.Premise) return undefined

      if (!conclusion1Step.assumptions.has(premiseStepIndex)) return undefined
      if (!conclusion2Step.assumptions.has(premiseStepIndex)) return undefined

      if (!isNegationOf(conclusion2Step.formula, conclusion1Step.formula)) return undefined

      return NegationIntroductionRuleInterface({
        deduction,
        step1Index: premiseStepIndex,
        step2Index: conclusion1StepIndex,
        step3Index: conclusion2StepIndex
      })
    },
    [Rule.NegationElimination]: () => {
      if (steps.length !== 1) return undefined

      const [stepIndex] = steps
      const { formula } = deduction.getStep(stepIndex)

      if (!isDoubleNegation(formula)) return undefined

      return NegationEliminationRuleInterface({ deduction, stepIndex })
    },
    [Rule.Explosion]: () => {
      if (steps.length !== 2) return undefined

      const [step1Index, step2Index] = steps
      const [step1, step2] = steps.map(i => deduction.getStep(i))

      if (!isNegationOf(step2.formula, step1.formula)) return undefined

      return ExplosionRuleInterface({
        deduction,
        affirmativeStepIndex: step1Index,
        negativeStepIndex: step2Index
      })
    },
    [Rule.Repetition]: () => {
      if (steps.length !== 1) return undefined

      const [stepIndex] = steps

      return RepetitionRuleInterface({ deduction, stepIndex })
    },
    [Rule.ConditionalElimination]: () => {
      if (steps.length !== 2) return undefined

      const [conditionalStepIndex, antecedentStepIndex] = steps
      const [conditional, antecedent] = steps.map(i => deduction.getStep(i).formula)

      if (!isConditionalFrom(conditional, antecedent)) return undefined

      return ConditionalEliminationRuleInterface({
        deduction,
        conditionalStepIndex,
        antecedentStepIndex
      })
    },
    [Rule.ConjunctionIntroduction]: () => {
      if (steps.length !== 2) return undefined

      const [conjunct1StepIndex, conjunct2StepIndex] = steps

      return ConjunctionIntroductionRuleInterface({
        deduction,
        premise1Index: conjunct1StepIndex,
        premise2Index: conjunct2StepIndex
      })
    },
    [Rule.ConjunctionElimination]: () => {
      if (steps.length !== 1) return undefined

      const [conjunctionStepIndex] = steps
      const conjunctionFormula = deduction.getStep(conjunctionStepIndex).formula

      if (!conjunctionFormula.sym.equals(conjunction)) return undefined

      return ConjunctionEliminationRuleInterface({ deduction, premiseIndex: conjunctionStepIndex })
    },
    [Rule.DisjunctionIntroduction]: () => {
      if (steps.length !== 1) return undefined

      const [premiseIndex] = steps

      return DisjunctionIntroductionRuleInterface({ deduction, premiseIndex })
    },
    [Rule.DisjunctionElimination]: () => {
      if (steps.length !== 3) return undefined

      const [
        disjunctionStepIndex,
        conditional1StepIndex,
        conditional2StepIndex
      ] = steps

      const [
        disjunctionStep,
        conditional1Step,
        conditional2Step
      ] = steps.map(stepIndex => deduction.getStep(stepIndex))

      if (!disjunctionStep.formula.sym.equals(disjunction)) return undefined
      if (!conditional1Step.formula.sym.equals(conditional)) return undefined
      if (!conditional2Step.formula.sym.equals(conditional)) return undefined

      const consequent = conditional1Step.formula.children[1]
      if (!isConditionalTo(conditional2Step.formula, consequent)) return undefined

      const [disjunct1, disjunct2] = disjunctionStep.formula.children

      if (!(
        isConditionalFrom(conditional1Step.formula, disjunct1) &&
        isConditionalFrom(conditional2Step.formula, disjunct2)
      )) {
        return undefined
      }

      return DisjunctionEliminationRuleInterface({
        deduction,
        disjunctionStepIndex,
        conditional1StepIndex,
        conditional2StepIndex,
        consequent
      })
    },
    [Rule.BiconditionalIntroduction]: () => {
      if (steps.length !== 2) return undefined

      const [conditional1, conditional2] = steps.map(i => deduction.getStep(i).formula)

      if (!conditional1.sym.equals(conditional)) return undefined
      if (!conditional2.sym.equals(conditional)) return undefined

      const [antecedent1, consequent1] = conditional1.children
      const [antecedent2, consequent2] = conditional2.children

      if (!isDeepEqual(antecedent1, consequent2)) return undefined
      if (!isDeepEqual(antecedent2, consequent1)) return undefined

      return BiconditionalIntroductionRuleInterface({
        deduction,
        premise1Index: steps[0],
        premise2Index: steps[1]
      })
    },
    [Rule.BiconditionalElimination]: () => {
      if (steps.length !== 1) return undefined

      const [premiseIndex] = steps

      const premise = deduction.getStep(premiseIndex).formula

      if (!premise.sym.equals(biconditional)) return undefined

      return BiconditionalEliminationRuleInterface({ deduction, premiseIndex })
    }
  }

  return ({
    chooseRule (rule) {
      const ruleInterface = handlers[rule]?.()

      if (ruleInterface === undefined) {
        throw createError(ErrorName.RULE_NOT_ALLOWED, `Rule ${rule} is not allowed.`, rule)
      }

      return ruleInterface
    }
  })
}
