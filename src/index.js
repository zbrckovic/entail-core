export {
  Expression, ExpressionPointer, connectWithBinarySym, Category, Kind, Sym
} from './abstract-structures'
export { Deduction, Rule, TermDependencyGraph } from './deduction-structure'
export { FormulaParser, DeductionParser } from './parsers'
export { ErrorName } from './error'
export { startDeduction } from './deduction-interface'
export {
  SymPresentation, Placement, SyntacticInfo, primitivePresentationCtx
} from './presentation/sym-presentation'
export {
  isContingent, isContradiction, isFalsifiable, isSatisfiable, isTautology
} from './propositional-logic'
export {
  existentialQuantifier,
  conjunction,
  disjunction,
  equivalence,
  implication,
  negation,
  primitiveSyms,
  universalQuantifier
} from './primitive-syms'
