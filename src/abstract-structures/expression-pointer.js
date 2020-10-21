import { createError, ErrorName } from '../error'
import { Expression } from './expression'

// Pointer to the specific subexpression of the base expression. Contains the base
// `expression` and the `position` which is a path to some subexpression of `expression`. This
// subexpression is called a **target**.
export const ExpressionPointer = ({ expression, position = [] }) => ({ expression, position })

ExpressionPointer.isRoot = pointer => pointer.position.length === 0

ExpressionPointer.getTarget = pointer =>
  Expression.getSubexpression(pointer.expression, pointer.position)

// Returns parent of the target or throws if there's no parent.
ExpressionPointer.getParent = pointer => {
  if (ExpressionPointer.isRoot(pointer)) throw createError(ErrorName.CANT_GET_PARENT_OF_ROOT)
  return { ...pointer, position: pointer.position.slice(0, -1) }
}

// Returns a path to the ancestor subexpression which binds `sym` at the target position. In other
// words, find the closest target's ancestor which has `sym` as its `boundSym`. If `sym` is not
// specified, target's `mainSym` is assumed.
ExpressionPointer.findBindingOccurrence = (pointer, sym) => {
  if (ExpressionPointer.isRoot(pointer)) return undefined

  sym = sym ?? ExpressionPointer.getTarget(pointer).sym

  const parentPointer = ExpressionPointer.getParent(pointer)
  const { boundSym } = ExpressionPointer.getTarget(parentPointer)

  return boundSym?.id === sym.id
    ? parentPointer.position
    : ExpressionPointer.findBindingOccurrence(parentPointer, sym)
}

// Returns free occurrences of `sym` at target.
ExpressionPointer.findFreeOccurrences = (pointer, sym) => {
  const target = ExpressionPointer.getTarget(pointer)

  return Expression
    .findFreeOccurrences(target, sym)
    .map(position => pointer.position.concat(position))
}

// Returns bound occurrences of target's `boundSym` at target.
ExpressionPointer.findBoundOccurrences = pointer => {
  const target = ExpressionPointer.getTarget(pointer)

  return Expression
    .findBoundOccurrences(target)
    .map(position => pointer.position.concat(position))
}

// Returns subexpression occurring on the path to `target`.
ExpressionPointer.getSubexpressionsOnPath = pointer => {
  const target = ExpressionPointer.getTarget(pointer)

  return Expression.getSubexpressionsOnPath(target.expression, pointer.position)
}

// Finds all symbols which are bound by target's ancestors. It doesn't necessarily search for
// symbols which actually appear in the target. It searches for all symbols S which would be
// bound by some ancestor if we replaced the target with some formula containing S as free symbol.
// In other words, it also returns vacuously bound symbols.
ExpressionPointer.getBoundSyms = pointer => {
  if (ExpressionPointer.isRoot(pointer)) return {}
  const parent = ExpressionPointer.getParent(pointer)
  const boundSym = ExpressionPointer.getTarget(parent).boundSym

  const result = {}

  if (boundSym !== undefined) {
    result[boundSym.id] = boundSym
  }

  Object.assign(result, ExpressionPointer.getBoundSyms(parent))

  return result
}