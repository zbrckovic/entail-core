import _ from 'lodash'
import { ErrorName } from '../error'
import { FormulaParser } from '../parsers'
import { primitivePresentations } from '../presentation/sym-presentation'
import { conditional, conjunction, primitiveSyms, universalQuantifier } from '../primitive-syms'
import { Expression } from './expression'
import { Sym } from './sym'

let parser
beforeEach(() => {
  parser = FormulaParser({
    syms: primitiveSyms,
    presentations: primitivePresentations
  })
})

test.each([
  ['p', [], 'p'],
  ['~p', [0], 'p'],
  ['p -> q', [1], 'q'],
  ['Ax Ex (Fxy -> Fyx)', [0, 0, 1], 'Fyx']
])('%s .getSubexpression(%j) is %s', (formulaText, position, expectedSubformulaText) => {
  const formula = parser.parse(formulaText)
  const expectedSubformula = parser.parse(expectedSubformulaText)
  const subformula = formula.getSubexpression(position)

  expect(subformula).toDeepEqual(expectedSubformula)
})

test.each([
  ['p', 'p', [[]]],
  ['p -> q', 'q', [[1]]],
  ['p -> (q -> p)', '->', [[], [1]]],
  ['Fx -> ~Gx', 'x', [[0, 0], [1, 0, 0]]],
  ['Ax Fy', 'y', [[0, 0]]],
  ['Ax Fx', 'x', []],
  ['Ax Fxy -> Ey Fyx', 'x', [[1, 0, 1]]]
])('%s .findFreeOccurrences(%s) is %j', (text, symbol, expectedPositions) => {
  const formula = parser.parse(text)
  const sym = parser.getSym(symbol)
  const positions = formula.findFreeOccurrences(sym)

  expect(positions).toDeepEqual(expectedPositions)
})

test.each([
  ['p'],
  ['Fx']
])(`%s .findBoundOccurrences() throws ${ErrorName.EXPRESSION_DOESNT_BIND}`, text => {
  const formula = parser.parse(text)

  expect(() => { formula.findBoundOccurrences() }).toThrow(ErrorName.EXPRESSION_DOESNT_BIND)
})

test.each([
  ['Ax Fx', [[0, 0]]],
  ['Ax Ex Fx', []],
  ['Ax (Ex Fyx -> Fyx)', [[0, 1, 1]]]
])('%s .findBoundOccurrences() is %j', (text, expectedPositions) => {
  const formula = parser.parse(text)
  const positions = formula.findBoundOccurrences()

  expect(positions).toDeepEqual(expectedPositions)
})

test.each([
  ['p', [], ['p']],
  ['~p', [0], ['~p', 'p']],
  ['Ax (Fx -> Gx)', [0, 1], ['Ax (Fx -> Gx)', 'Fx -> Gx', 'Gx']]
])('%s .getSubexpressionsOnPath(%j) is %s', (text, path, expectedFormulasTexts) => {
  const formula = parser.parse(text)
  const expectedFormulas = expectedFormulasTexts.map(
    expectedFormulaText => parser.parse(expectedFormulaText)
  )

  const formulas = formula.getSubexpressionsOnPath(path)

  expect(formulas).toDeepEqual(expectedFormulas)
})

test.each([
  ['p', 'p', 'p', 'p', undefined, undefined],
  ['p', 'p', 'q', 'q', undefined, undefined],
  ['~p', 'p', 'q', '~q', undefined, undefined],
  ['(p -> q) & (q -> p)', 'p', 'r', '(r -> q) & (q -> r)', undefined, undefined],
  ['p -> (q -> p)', 'p', 'q', 'q -> (q -> q)', undefined, undefined],
  ['Ax Fx', 'x', 'y', 'Ax Fx', undefined, undefined],
  ['Ay Fx', 'x', 'y', 'Ay Fy', undefined, undefined],
  ['(Ax Fx) -> Gx', 'x', 'y', '(Ax Fx) -> Gy', undefined, undefined],
  ['~p', '~', '->', 'p -> q', undefined, () => 'q'],
  ['~Fx', '~', 'A', 'Ay Fx', () => 'y', undefined],
  ['p -> q', '->', 'A', 'Ax p', () => 'x', undefined],
  ['p', 'p', 'A', 'Ax q', () => 'x', () => 'q']
])(
  '%s .replaceFreeOccurrences(%s, %s) is %s',
  (
    oldFormulaText,
    oldSymText,
    newSymText,
    expectedNewFormulaText,
    getBoundSymText,
    getChildText
  ) => {
    const oldFormula = parser.parse(oldFormulaText)
    const expectedNewFormula = parser.parse(expectedNewFormulaText)
    const oldSym = parser.getSym(oldSymText)
    const newSym = parser.getSym(newSymText)
    const getBoundSym = () => parser.getSym(getBoundSymText())
    const getChild = () => parser.parse(getChildText())
    const newFormula = oldFormula.replaceFreeOccurrences(oldSym, newSym, getBoundSym, getChild)

    expect(newFormula).toDeepEqual(expectedNewFormula)
  }
)

test.each([
  ['Ax Fx', 'y', 'Ay Fy'],
  ['Ax (Ex Fx -> Fx)', 'y', 'Ay (Ex Fx -> Fy)']
])(
  '%s .replaceBoundOccurrences(%s) is %s',
  (oldFormulaText, symText, expectedNewFormulaText) => {
    const oldFormula = parser.parse(oldFormulaText)
    const expectedNewFormula = parser.parse(expectedNewFormulaText)
    const sym = parser.getSym(symText)
    const newFormula = oldFormula.replaceBoundOccurrences(sym)

    expect(newFormula).toDeepEqual(expectedNewFormula)
  }
)

test.each([
  ['p -> Ax Fx', 'y', [1], 'p -> Ay Fy'],
  ['Ax (Ex Fx -> Fx)', 'y', [0, 0], 'Ax (Ey Fy -> Fx)']
])(
  '%s .replaceBoundOccurrencesAt(%s, %j) is %s',
  (oldFormulaText, symbolText, position, expectedNewFormulaText) => {
    const oldFormula = parser.parse(oldFormulaText)
    const expectedNewFormula = parser.parse(expectedNewFormulaText)
    const sym = parser.getSym(symbolText)
    const newFormula = oldFormula.replaceBoundOccurrencesAt(position, sym)

    expect(newFormula).toDeepEqual(expectedNewFormula)
  }
)

test.each([
  ['p', ['p']],
  ['~p', ['~', 'p']],
  ['~~p', ['~', 'p']],
  ['Ax p', ['A', 'x', 'p']],
  ['Ax Fxy -> Ey Fyx', ['A', 'E', '->', 'F', 'x', 'y']]
])('%s .getSyms() is %j', (formulaText, symsTexts) => {
  const formula = parser.parse(formulaText)
  const expectedSyms = _.fromPairs(
    symsTexts
      .map(symText => parser.getSym(symText))
      .map(sym => ([sym.id, sym]))
  )
  const syms = formula.getSyms()

  expect(syms).toDeepEqual(expectedSyms)
})

test.each([
  ['p', ['p']],
  ['~p', ['~', 'p']],
  ['Ax Fxy', ['A', 'F', 'y']],
  ['Ax Ey Fxy', ['A', 'E', 'F']],
  ['Ax Fx -> Ey Gyx', ['A', 'E', 'F', 'G', '->', 'x']]
])('%s .getFreeSyms() is %j', (formulaText, symsTexts) => {
  const formula = parser.parse(formulaText)
  const expectedSyms = _.fromPairs(
    symsTexts
      .map(symText => parser.getSym(symText))
      .map(sym => ([sym.id, sym]))
  )
  const syms = formula.getFreeSyms()

  expect(syms).toDeepEqual(expectedSyms)
})

test.each([
  ['Fxy', 'x', []],
  ['Ax Fxy', 'x', []],
  ['Ax Fxy', 'y', ['x']],
  ['Ax Fzx & Ey Fzy', 'z', ['x', 'y']]
])('%s .findBoundSymsAtFreeOccurrencesOfSym() is %j', (formulaText, symText, symsTexts) => {
  const formula = parser.parse(formulaText)
  const sym = parser.getSym(symText)
  const expectedSyms = _.fromPairs(
    symsTexts
      .map(symText => parser.getSym(symText))
      .map(sym => [sym.id, sym])
  )
  const syms = formula.findBoundSymsAtFreeOccurrencesOfSym(sym)

  expect(syms).toDeepEqual(expectedSyms)
})

const maxPrimitiveId = Math.max(..._.values(primitiveSyms).map(({ id }) => id))

test.each([
  [
    // p
    Expression({ sym: Sym.ff({ id: 2 }) }),
    {},
    Expression({ sym: Sym.ff({ id: 0 }) }),
    { 2: Sym.ff({ id: 0 }) }
  ],
  [
    Expression({ sym: Sym.ff({ id: 2 }) }),
    { 2: Sym.ff({ id: 3 }) },
    Expression({ sym: Sym.ff({ id: 3 }) }),
    { 2: Sym.ff({ id: 3 }) }
  ],
  [
    // p -> p
    Expression.connectWithBinarySym([
      Expression({ sym: Sym.ff({ id: maxPrimitiveId + 2 }) }),
      Expression({ sym: Sym.ff({ id: maxPrimitiveId + 2 }) })
    ], conditional),
    primitiveSyms,
    Expression.connectWithBinarySym([
      Expression({ sym: Sym.ff({ id: maxPrimitiveId + 1 }) }),
      Expression({ sym: Sym.ff({ id: maxPrimitiveId + 1 }) })
    ], conditional),
    {
      ...primitiveSyms,
      [maxPrimitiveId + 2]: Sym.ff({ id: maxPrimitiveId + 1 })
    }
  ],
  [
    // Ax Fx
    Expression({
      sym: universalQuantifier,
      boundSym: Sym.tt({ id: maxPrimitiveId + 3 }),
      children: [
        Expression({
          sym: Sym.ft({ id: maxPrimitiveId + 2 }),
          children: [
            Expression({
              sym: Sym.tt({ id: maxPrimitiveId + 3 })
            })
          ]
        })
      ]
    }),
    primitiveSyms,
    Expression({
      sym: universalQuantifier,
      boundSym: Sym.tt({ id: maxPrimitiveId + 1 }),
      children: [
        Expression({
          sym: Sym.ft({ id: maxPrimitiveId + 2 }),
          children: [
            Expression({
              sym: Sym.tt({ id: maxPrimitiveId + 1 })
            })
          ]
        })
      ]
    }),
    {
      ...primitiveSyms,
      [maxPrimitiveId + 2]: Sym.ft({ id: maxPrimitiveId + 2 })
    }
  ],
  [
    // Ax Fxy
    Expression({
      sym: universalQuantifier,
      boundSym: Sym.tt({ id: maxPrimitiveId + 2 }),
      children: [
        Expression({
          sym: Sym.ft({ id: maxPrimitiveId + 3 }),
          children: [
            Expression({
              sym: Sym.tt({ id: maxPrimitiveId + 2 })
            }),
            Expression({
              sym: Sym.tt({ id: maxPrimitiveId + 1 })
            })
          ]
        })
      ]
    }),
    primitiveSyms,
    Expression({
      sym: universalQuantifier,
      boundSym: Sym.tt({ id: maxPrimitiveId + 1 }),
      children: [
        Expression({
          sym: Sym.ft({ id: maxPrimitiveId + 2 }),
          children: [
            Expression({
              sym: Sym.tt({ id: maxPrimitiveId + 1 })
            }),
            Expression({
              sym: Sym.tt({ id: maxPrimitiveId + 3 })
            })
          ]
        })
      ]
    }),
    {
      ...primitiveSyms,
      [maxPrimitiveId + 3]: Sym.ft({ id: maxPrimitiveId + 2 }),
      [maxPrimitiveId + 1]: Sym.tt({ id: maxPrimitiveId + 3 })
    }
  ]
])('.normalize()', (formula, syms, expectedFormula, expectedSyms) => {
  const [actualFormula, actualSyms] = formula.normalize(syms)

  expect(actualFormula).toDeepEqual(expectedFormula)
  expect(actualSyms).toDeepEqual(expectedSyms)
})

test.each([
  [['p', 'q'], conjunction, 'p & q'],
  [['p', 'q', 'r'], conjunction, '(p & q) & r']
])('.connectWithBinarySym(%s) is %s', (expressionTexts, sym, expectedExpressionText) => {
  const expressions = expressionTexts.map(text => parser.parse(text))
  const expected = expectedExpressionText === undefined
    ? undefined
    : parser.parse(expectedExpressionText)

  const actual = Expression.connectWithBinarySym(expressions, sym)

  expect(actual).toDeepEqual(expected)
})

test(`.connectWithBinarySym() throws ${ErrorName.NOT_ENOUGH_EXPRESSIONS} for empty list`, () => {
  expect(() => { Expression.connectWithBinarySym([], conjunction) })
    .toThrow(ErrorName.NOT_ENOUGH_EXPRESSIONS)
})

test(
  `.connectWithBinarySym() throws ${ErrorName.NOT_ENOUGH_EXPRESSIONS} for singleton list`,
  () => {
    const expression = parser.parse('p')

    expect(() => { Expression.connectWithBinarySym([expression], conjunction) })
      .toThrow(ErrorName.NOT_ENOUGH_EXPRESSIONS)
  }
)
