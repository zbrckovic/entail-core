import { List, OrderedSet, Record } from 'immutable'
import { Expression } from '../../abstract-structures/expression'
import { existentialQuantifier, implication, universalQuantifier } from '../../primitive-syms'
import { Rule } from '../rule'
import { TermDependencies } from '../term-dependency-graph/term-dependencies'

/**
 * Contains all information necessary to apply a regular rule (not theorem rule) against a
 * deduction.
 *
 * Notes:
 * - Deduction to which the rule will be applied we will call 'target deduction'.
 * - In the following lines we sometimes refer to formulas by numbers. Number in such contexts is
 *   the index of the target deduction's step which introduced the formula in question (as a result
 *   of the premise rule or theorem rule).
 *
 * All rules (except theorem) are reduced to this object. It contains all data necessary to
 * construct the next step of the target deduction. This object can be considered as some sort of a
 * common denominator of all regular rules.
 *
 * Note: static factory methods don't validate data!
 */
export class RegularRuleApplicationSpec extends Record({
  rule: Rule.Premise,
  /** Formulas which will serve as the premises of this rule. */
  premises: OrderedSet(),
  /** Resulting formula which will be introduced in the next target deduction's step. */
  conclusion: new Expression(),
  /** Term dependencies with which to extend target deduction's term dependency graph. **/
  termDependencies: undefined,
  /** Assumptions to remove from the inherited set of assumptions. **/
  assumptionToRemove: undefined
}, 'RegularRuleApplicationSpec') {
  static premise(premise) {
    return new RegularRuleApplicationSpec({
      rule: Rule.Premise,
      conclusion: premise
    })
  }

  static deduction(antecedent, antecedentIndex, consequent, consequentIndex) {
    return new RegularRuleApplicationSpec({
      rule: Rule.Deduction,
      premises: OrderedSet.of(antecedentIndex, consequentIndex),
      conclusion: new Expression({
        sym: implication,
        children: List.of(antecedent, consequent)
      }),
      assumptionToRemove: antecedentIndex
    })
  }

  static tautologicalImplication(premises, conclusion) {
    return new RegularRuleApplicationSpec({
      rule: Rule.TautologicalImplication,
      premises,
      conclusion
    })
  }

  static universalInstantiation({ boundSym, children }, premiseIndex, newTerm) {
    const child = children.get(0)
    const conclusion = newTerm !== undefined
      ? child.replaceFreeOccurrences(boundSym, newTerm)
      : child

    return new RegularRuleApplicationSpec({
      rule: Rule.UniversalInstantiation,
      premises: OrderedSet.of(premiseIndex),
      conclusion
    })
  }

  static universalGeneralization(premise, premiseIndex, newTerm, oldTerm,) {
    const child = oldTerm !== undefined
      ? premise.replaceFreeOccurrences(oldTerm, newTerm)
      : premise

    return new RegularRuleApplicationSpec({
      rule: Rule.UniversalGeneralization,
      premises: OrderedSet.of(premiseIndex),
      conclusion: new Expression({
        sym: universalQuantifier,
        boundSym: newTerm,
        children: List.of(child)
      }),
      termDependencies: oldTerm !== undefined
        ? premise
          .getFreeTerms()
          .remove(oldTerm)
          .reduce(
            (acc, dependencyTerm) => acc.addDependency(dependencyTerm),
            new TermDependencies({ dependent: oldTerm })
          )
        : undefined
    })
  }

  static existentialInstantiation({ boundSym, children }, premiseIndex, newTerm) {
    const child = children.get(0)
    const conclusion = newTerm !== undefined
      ? child.replaceFreeOccurrences(boundSym, newTerm)
      : child

    return new RegularRuleApplicationSpec({
      rule: Rule.ExistentialInstantiation,
      premises: OrderedSet.of(premiseIndex),
      conclusion,
      termDependencies: newTerm !== undefined
        ? conclusion
          .getFreeTerms()
          .remove(newTerm)
          .reduce(
            (acc, dependencyTerm) => acc.addDependency(dependencyTerm),
            new TermDependencies({ dependent: newTerm })
          )
        : undefined
    })
  }

  static existentialGeneralization(premise, premiseIndex, newTerm, oldTerm) {
    const child = oldTerm !== undefined
      ? premise.replaceFreeOccurrences(oldTerm, newTerm)
      : premise

    return new RegularRuleApplicationSpec({
      rule: Rule.ExistentialGeneralization,
      premises: OrderedSet.of(premiseIndex),
      conclusion: new Expression({
        sym: existentialQuantifier,
        boundSym: newTerm,
        children: List.of(child)
      })
    })
  }
}