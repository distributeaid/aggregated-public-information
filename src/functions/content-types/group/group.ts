export function processGroup(data) {
  if (data.shortName) {
    data.shortNameStripped = generateNameStripped(data.shortName);
  }
  if (data.groupName) {
    data.groupNameStripped = generateNameStripped(data.groupName);
  }
  if (data.groupConvertFrom) {
    data.groupConvertFromStripped = generateNameStripped(data.groupConvertFrom);
  }
  return data;
}

function generateNameStripped(name) {
  // Remove non-alphanumeric characters except spaces and preserve non-English characters
  name = name.replace(/[^a-zA-Z0-9\s\u00C0-\u024F]/g, "");

  // Ensure only one space between words and trim spaces at the ends
  name = name.replace(/\s+/g, " ").trim();

  // Capitalize the first letter of each word
  name = name
    .split(" ")
    .map((word) => capitalizeFirstLetter(word))
    .join(" ");

  return name;
}

function capitalizeFirstLetter(word) {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}
