import { DeductionParser } from '../parsers/deduction-parser'
import { primitiveSyms } from '../primitive-syms'
import { primitivePresentations } from '../presentation/sym-presentation'
import { deflateDeduction, inflateDeduction } from './deduction-inflate-deflate'

let parser
beforeEach(() => {
  parser = DeductionParser({
    syms: primitiveSyms,
    presentations: primitivePresentations
  })
})

test.each([
  [
    `
        (1) Ey Ax Fxy              / P;
    1   (2) Ax Fxa                 / EI 1;
    1   (3) Fba                    / UI 2;
    1   (4) Ey Fby                 / EG 3;
    1   (5) Ax Ey Fxy              / UG 4;
        (6) Ey Ax Fxy -> Ax Ey Fxy / D 1, 5;
    `
  ],
  [
    `
          (1)  Ax (Fx -> Gx)                                        / P;
          (2)  Ax (Gx -> Hx)                                        / P;
          (3)  Ex Fx                                                / P;
        3 (4)  Fa                                                   / EI 3;
        1 (5)  Fa -> Ga                                             / UI 1;
        2 (6)  Ga -> Ha                                             / UI 2;
    1,2,3 (7)  Ha                                                   / TI 4,5,6;
    1,2,3 (8)  Ex Hx                                                / EG 7;
      1,2 (9)  Ex Fx -> Ex Hx                                       / D 3, 8;
        1 (10) Ax (Gx -> Hx) -> (Ex Fx -> Ex Hx)                    / D 2, 9;
          (11) Ax (Fx -> Gx) -> (Ax (Gx -> Hx) -> (Ex Fx -> Ex Hx)) / D 1, 10;
    `
  ]
])('deflateDeduction and inflateDeduction', text => {
  const deduction = parser.parse(text)

  const deflated = deflateDeduction(deduction)
  const inflated = inflateDeduction(deflated)

  expect(deduction).toEqual(inflated)
})
