import { Sym } from './abstract-structures'

export const negation = Sym.ff({ id: 0, arity: 1 })
export const conjunction = Sym.ff({ id: 1, arity: 2 })
export const disjunction = Sym.ff({ id: 2, arity: 2 })
export const conditional = Sym.ff({ id: 3, arity: 2 })
export const biconditional = Sym.ff({ id: 4, arity: 2 })
export const universalQuantifier = Sym.ff({ id: 5, arity: 1, binds: true })
export const existentialQuantifier = Sym.ff({ id: 6, arity: 1, binds: true })

export const primitiveSyms = {
  [negation.id]: negation,
  [conjunction.id]: conjunction,
  [disjunction.id]: disjunction,
  [conditional.id]: conditional,
  [biconditional.id]: biconditional,
  [universalQuantifier.id]: universalQuantifier,
  [existentialQuantifier.id]: existentialQuantifier
}
