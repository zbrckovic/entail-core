import { Record } from 'immutable'
import { Expression } from '../../abstract-structures/expression'
import { Rule } from '../rule'

/** Contains all information necessary to apply the theorem rule against a deduction. */
export class TheoremRuleApplicationSpec extends Record({
  rule: Rule.Theorem,
  /** Identifier of the theorem in a project. */
  theoremId: '',
  theorem: new Expression()
}, 'TheoremRuleApplicationSpec') {}