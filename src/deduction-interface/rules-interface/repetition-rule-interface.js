import stampit from '@stamp/it'
import { RegularRuleApplicationSpec } from '../../deduction-structure/rule-application-spec'
import { Rule } from '../../deduction-structure'
import { startDeduction } from '../deduction-interface'

export const RepetitionRuleInterface = stampit({
  name: 'RepetitionRuleInterface',
  init ({ deduction, stepIndex }) {
    this.deduction = deduction
    this.stepIndex = stepIndex
  },
  methods: {
    apply () {
      const conclusion = this.deduction.getStep(this.stepIndex).formula

      const ruleApplicationSpec = RegularRuleApplicationSpec({
        rule: Rule.Repetition,
        premises: [this.stepIndex],
        conclusion
      })
      const newDeduction = this.deduction.applyRule(ruleApplicationSpec)

      return startDeduction(newDeduction)
    }
  }
})
