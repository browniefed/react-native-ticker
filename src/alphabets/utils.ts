const PRIMITIVES = "undefined/boolean/number/bigint/string/symbol"

export const mapObject = <T>(
  object: T,
  op: Function = (a: string) => a.split('')
): T =>
  PRIMITIVES.includes(typeof object)
   ? op(object)
   : Array.isArray(object)
    ? object.map(item => mapObject(item , op))
    : Object.keys(object).reduce((result, key) => ({
        ...result,
        [key]: mapObject(object[key], op)
      }) , {})
