import { Category, Expression, Kind, Sym } from '../../abstract-structures'
import { createError, ErrorName } from '../../error'
import {
  createTextToSymMap,
  getMaxSymId,
  Placement,
  SymPresentation,
  SyntacticInfo
} from '../../presentation/sym-presentation'
import { isBracketed } from '../peg/ast-formula'

// `AstProcessor` can process formula AST (the result of parsing formula) and create an
// `Expression`. As a side-effect of this processing it updates its internal state. Internal state
// tracks information about processed symbols.
export const AstProcessor = ({
  // All symbols by their ids.
  syms,
  // Presentations by symbol ids.
  presentations,
  // Symbols by their ascii representation texts (used for optimization).
  textToSymMap = createTextToSymMap(presentations, syms),
  // Used when new symbol must be introduced to decide about its id (used for optimization).
  maxSymId = getMaxSymId(textToSymMap)
}) => {
  // Processes formula AST (returned from peg parser) and tries to construct an expression (more
  // precisely it tries to construct a formula because parser accepts only formula expressions). If
  // it can't, throws an error.
  const process = (ast, kind = Kind.Formula) => {
    if (isBracketed(ast)) return process(ast.expression, kind)

    const childrenAsts = ast.children
    const arity = childrenAsts.length

    const mainSym = textToSymMap[ast.sym] ??
      createSym(kind, arity, ast.boundSym !== undefined, ast.sym, ast.symPlacement)

    const mainSymPresentation = presentations[mainSym.id]

    if (mainSymPresentation.ascii.placement !== ast.symPlacement) {
      throw createError(
        ErrorName.INVALID_SYMBOL_PLACEMENT,
        undefined,
        { sym: mainSym, presentation: mainSymPresentation, placement: ast.symPlacement }
      )
    }

    if (mainSym.arity !== arity) {
      throw createError(
        ErrorName.INVALID_ARITY,
        undefined,
        { sym: mainSym, presentation: mainSymPresentation, arity }
      )
    }
    if (mainSym.kind !== kind) {
      throw createError(
        ErrorName.INVALID_SYMBOL_KIND,
        undefined,
        { sym: mainSym, presentation: mainSymPresentation, kind }
      )
    }

    let boundSym
    if (ast.boundSym !== undefined) {
      boundSym = textToSymMap[ast.boundSym]

      if (boundSym !== undefined) {
        if (boundSym.getCategory() !== Category.TT) {
          throw createError(
            ErrorName.INVALID_BOUND_SYMBOL_CATEGORY,
            undefined,
            { sym: boundSym, presentation: presentations[boundSym.id] }
          )
        }

        if (boundSym.arity !== 0) {
          throw createError(
            ErrorName.INVALID_BOUND_SYMBOL_ARITY,
            undefined,
            { sym: boundSym, presentation: presentations[boundSym.id] }
          )
        }
      } else {
        boundSym = createSym(Kind.Term, 0, false, ast.boundSym, Placement.Prefix)
      }
    }

    return Expression({
      sym: mainSym,
      boundSym: boundSym,
      children: childrenAsts.map(childAst => process(childAst, mainSym.argumentKind))
    })
  }

  // Updates internal state by adding new association between symbol and its presentation.
  const addPresentation = (sym, presentation) => {
    syms = { ...syms, [sym.id]: sym }
    presentations = { ...presentations, [sym.id]: presentation }
    textToSymMap = { ...textToSymMap, [presentation.ascii.text]: sym }
    maxSymId = Math.max(maxSymId, sym.id)
  }

  // Creates new symbol, generates new id for it, updates internal state according to the new symbol
  // addition and returns newly created symbol.
  const createSym = (kind, arity, binds, text, placement) => {
    const argumentKind = determineArgumentKind(kind, text)
    const id = maxSymId + 1
    const sym = Sym({ id, kind, argumentKind, arity, binds })
    const presentation = SymPresentation({ ascii: SyntacticInfo({ text, placement }) })

    addPresentation(sym, presentation)

    return sym
  }

  return {
    process,
    createSym,
    addPresentation,
    // Gets symbol associated with `text`.
    getSym: text => textToSymMap[text],
    getSyms: () => syms,
    getPresentations: () => presentations,
    getTextToSymMap: () => textToSymMap,
    getMaxSymId: () => maxSymId
  }
}

const determineArgumentKind = (kind, text) => {
  switch (kind) {
    case Kind.Formula: {
      if (isUpperWord(text)) return Kind.Term
      if (isLowerWord(text)) return Kind.Formula
      break
    }
    case Kind.Term: {
      if (isLowerWord(text)) return Kind.Term
      break
    }
  }
}

const isUpperWord = text => /^[A-Z]\w*/.test(text)
const isLowerWord = text => /^[a-z]\w*/.test(text)
