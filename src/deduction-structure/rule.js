// Fixed set of rule names/identifiers available in deduction.
export const Rule = {
  Premise: 'Premise',
  Theorem: 'Theorem',

  TautologicalImplication: 'TautologicalImplication',

  NegationIntroduction: 'NegationIntroduction',
  NegationElimination: 'DoubleNegationElimination',

  ConditionalIntroduction: 'Deduction',
  ConditionalElimination: 'ConditionalElimination',

  ConjunctionIntroduction: 'ConjunctionIntroduction',
  ConjunctionElimination: 'ConjunctionElimination',

  DisjunctionIntroduction: 'DisjunctionIntroduction',
  DisjunctionElimination: 'DisjunctionElimination',

  BiconditionalIntroduction: 'BiconditionalIntroduction',
  BiconditionalElimination: 'BiconditionalElimination',

  Explosion: 'Explosion',
  Repetition: 'Repetition',

  UniversalGeneralization: 'UniversalGeneralization',
  UniversalInstantiation: 'UniversalInstantiation',

  ExistentialGeneralization: 'ExistentialGeneralization',
  ExistentialInstantiation: 'ExistentialInstantiation'
}

export const getAbbreviation = rule => ruleToAbbreviation[rule]
export const getRule = abbreviation => abbreviationToRule[abbreviation]

const ruleToAbbreviation = {
  [Rule.Premise]: 'P',
  [Rule.Theorem]: 'T',

  [Rule.TautologicalImplication]: 'TI',

  [Rule.NegationIntroduction]: 'NOT+',
  [Rule.NegationElimination]: 'NOT-',

  [Rule.ConditionalIntroduction]: 'IF+',
  [Rule.ConditionalElimination]: 'IF-',

  [Rule.ConjunctionIntroduction]: 'AND+',
  [Rule.ConjunctionElimination]: 'AND-',

  [Rule.DisjunctionIntroduction]: 'OR+',
  [Rule.DisjunctionElimination]: 'OR-',

  [Rule.BiconditionalIntroduction]: 'IFF+',
  [Rule.BiconditionalElimination]: 'IFF-',

  [Rule.Explosion]: 'X',
  [Rule.Repetition]: 'REP',

  [Rule.UniversalInstantiation]: 'A-',
  [Rule.UniversalGeneralization]: 'A+',

  [Rule.ExistentialInstantiation]: 'E-',
  [Rule.ExistentialGeneralization]: 'E+'
}

const abbreviationToRule = {
  P: Rule.Premise,
  T: Rule.Theorem,

  TI: Rule.TautologicalImplication,

  'IF+': Rule.ConditionalIntroduction,
  'IF-': Rule.ConditionalElimination,

  'NOT+': Rule.NegationIntroduction,
  'NOT-': Rule.NegationElimination,

  'AND+': Rule.ConjunctionIntroduction,
  'AND-': Rule.ConjunctionElimination,

  'OR+': Rule.DisjunctionIntroduction,
  'OR-': Rule.DisjunctionElimination,

  'IFF+': Rule.BiconditionalIntroduction,
  'IFF-': Rule.BiconditionalElimination,

  X: Rule.Explosion,
  REP: Rule.Repetition,

  'A-': Rule.UniversalInstantiation,
  'A+': Rule.UniversalGeneralization,
  'E-': Rule.ExistentialInstantiation,
  'E+': Rule.ExistentialGeneralization
}
