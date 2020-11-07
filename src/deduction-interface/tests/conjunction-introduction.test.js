import { Deduction, Rule } from '../../deduction-structure'
import { RegularRuleApplicationSummary, Step } from '../../deduction-structure/step'
import { FormulaParser } from '../../parsers/formula-parser'
import { primitivePresentations } from '../../presentation/sym-presentation'
import { primitiveSyms } from '../../primitive-syms'
import { startDeduction } from '../deduction-interface'

let parser
beforeEach(() => {
  parser = new FormulaParser({
    syms: primitiveSyms,
    presentations: primitivePresentations
  })
})

test.each([
  ['p', 'q', [1, 2], [0, 1]],
  ['q', 'p', [2, 1], [1, 0]]
])('conjunction introduction', (
  premise1Text,
  premise2Text,
  selectedSteps,
  rulePremises
) => {
  const premise1 = parser.parse(premise1Text)
  const premise2 = parser.parse(premise2Text)
  const conclusion = parser.parse('p & q')

  const deduction = Deduction({
    steps: [
      Step({
        formula: premise1,
        ruleApplicationSummary: RegularRuleApplicationSummary({ rule: Rule.Premise })
      }),
      Step({
        formula: premise2,
        ruleApplicationSummary: RegularRuleApplicationSummary({ rule: Rule.Premise })
      })
    ]
  })

  const newDeduction = startDeduction(deduction)
    .selectSteps(...selectedSteps)
    .chooseRule(Rule.ConjunctionIntroduction)
    .apply()
    .deduction

  const actual = Deduction.getLastStep(newDeduction)

  const expected = Step({
    assumptions: new Set([0, 1]),
    formula: conclusion,
    ruleApplicationSummary: RegularRuleApplicationSummary({
      rule: Rule.ConjunctionIntroduction,
      premises: rulePremises
    })
  })

  expect(actual).toEqual(expected)
})