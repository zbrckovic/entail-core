import { FormulaParser } from '../../parsers'
import { primitiveSyms } from '../../primitive-syms'
import { primitivePresentations } from '../../presentation/sym-presentation'
import { Deduction, Rule } from '../../deduction-structure'
import { RegularRuleApplicationSummary, Step } from '../../deduction-structure/step'
import { startDeduction } from '../deduction-interface'

let parser
beforeEach(() => {
  parser = FormulaParser({
    syms: primitiveSyms,
    presentations: primitivePresentations
  })
})

describe('repetition', () => {
  test('p |- p', () => {
    const premise = parser.parse('p')

    const deduction = Deduction({
      steps: [
        Step({
          formula: premise,
          ruleApplicationSummary: RegularRuleApplicationSummary({ rule: Rule.Premise })
        })
      ]
    })

    const newDeduction = startDeduction(deduction)
      .selectSteps(1)
      .chooseRule(Rule.Repetition)
      .apply()
      .deduction

    const actual = newDeduction.getLastStep()

    const expected = Step({
      assumptions: new Set([0]),
      formula: premise,
      ruleApplicationSummary: RegularRuleApplicationSummary({
        rule: Rule.Repetition,
        premises: [0]
      })
    })

    expect(actual).toDeepEqual(expected)
  })
})
