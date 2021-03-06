export {
  Expression, ExpressionPointer, Category, Kind, Sym
} from './abstract-structures'
export {
  Deduction,
  Rule,
  TermDependencyGraph,
  getAbbreviation,
  getRule
} from './deduction-structure'
export {
  FormulaParser,
  DeductionParser,
  isPredicateVariable,
  isPropositionalVariable,
  isIndividualVariable,
  isFunctionVariable
} from './parsers'
export { ErrorName } from './error'
export { startDeduction } from './deduction-interface'
export {
  SymPresentation, Placement, SyntacticInfo, primitivePresentations
} from './presentation/sym-presentation'
export {
  isContingent, isContradiction, isFalsifiable, isSatisfiable, isTautology
} from './propositional-logic'
export {
  existentialQuantifier,
  conjunction,
  disjunction,
  biconditional,
  conditional,
  negation,
  primitiveSyms,
  universalQuantifier
} from './primitive-syms'
