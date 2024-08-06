export function toTitleCase(input: string) {
  return input.replace(
    /\w[^\s|^\.]*/g,
    text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
  );
}