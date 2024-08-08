export function toTitleCase(input: string) {
  return input.replace(
    /\w[^\s|.|\-|\/]*/g,
    (text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase(),
  );
}

export function toBoolean(input: string, empty: boolean | undefined = false) {
  input = input.toLowerCase()

  if (input === "") {
    return empty
  }

  if (input === "true") {
    return true
  }

  if (input === "false") {
    return false
  }

  throw new Error(`toBoolean: input string "${input}" is not a boolean`)
}

export function stripAndParseInt(numberString: string): number {
  return parseInt(numberString.replace(/\$|,/g, ""));
}

export function stripAndParseFloat(numberString: string): number {
  return parseFloat(numberString.replace(/\$|,|%/g, ""));
}
