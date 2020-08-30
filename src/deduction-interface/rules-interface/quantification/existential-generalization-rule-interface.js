import { RegularRuleApplicationSpec } from '../../../deduction-structure/rule-application-spec'
import { DeductionInterface } from '../../deduction-interface'
import { GeneralizationRuleInterface } from './generalization-rule-interface'

export class ExistentialGeneralizationRuleInterface extends GeneralizationRuleInterface {
  concreteApply(newTerm, oldTerm) {
    const ruleApplicationSpec = RegularRuleApplicationSpec.existentialGeneralization(
      this.premise,
      this.stepIndex,
      newTerm,
      oldTerm
    )
    const newDeduction = this.deduction.applyRule(ruleApplicationSpec)
    return new DeductionInterface(newDeduction)
  }
}