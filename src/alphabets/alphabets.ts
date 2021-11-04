import { Digits, DecimalPoints, EmojisCharset, LanguageCharset } from './charSets'
import { mapObject } from './utils'

const getAllCasings = (alphabet: string): any => {
  const LowerCase = alphabet.toLowerCase()
  const UpperCase = alphabet.toUpperCase()
  return LowerCase === UpperCase
    ? LowerCase
    : { LowerCase, UpperCase, MixedCase: `${LowerCase}${UpperCase}` }
}

// Get English casings for the Math bases
const {
  LowerCase: LowerEN, UpperCase: UpperEN, MixedCase: MixedEN
} = getAllCasings(LanguageCharset.English)

// Each of the number ones, starting from base-2 (base-1 doesn't make sense?):
const bases1 = [...Array(9).keys()]
  .map(i => ({ [`base${i + 2}`]: Digits.substr(0, i + 2) }))

// Node's native hex is 0-9 followed by *lowercase* a-f, so we'll take that
// approach for everything from base-11 to base-16:
const bases2 = [...Array(6).keys()]
  .map(i => ({ [`base${i + 11}`]: `${Digits}${LowerEN}`.substr(0, i + 11) }))

// A utility function to map between charSet path and the actual set
export const getAlphabet = (alphabet: object, path: string) =>
  path
    .split('.')
    .reduce((prev: any, key) =>
      typeof prev === 'string' || prev == null ? prev : prev[key]
    , alphabet)

// Create common software number bases
export const Numerals = Object.assign({}, ...bases1, ...bases2, {
  'base26': LowerEN,
  'base32': `${Digits}${UpperEN}`.replace(/[ILOU]/g, ''),
  'base36': `${Digits}${LowerEN}`,
  'base52': MixedEN,
  'base58': `${Digits}${MixedEN}`.replace(/[0OlI]/g, ''),
  'base62': `${Digits}${MixedEN}`,
  'base64': `${Digits}${MixedEN}+/`
})

// For each language, create a lowerCase, upperCase, mixedCase versions of the alphabet
export const Language = Object.keys(LanguageCharset)
  .reduce((langs, lang: string) => ({
    ...langs, [`${lang}`]: getAllCasings((LanguageCharset as any)[`${lang}`])
  }), {})

// Common KeyPad character sets
export const Keypad = {
  Numpad: `${Digits}${DecimalPoints}`
}

// Emojis character sets
export const Emojis = {
  ...EmojisCharset,
  All: Object.keys(EmojisCharset)
    .reduce((s, key) => `${s}${(EmojisCharset as any)[key]}`, '')
}

export const Alphabets = { Numerals, Language, Keypad, Emojis }
export const RotateAlphabets = mapObject(Alphabets)
