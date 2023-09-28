export const slugify = (field) =>
  field
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");

export const toTitleCase = (str) => {
  return str.replace(/\w\S*/g, function (text) {
    return text.charAt(0).toUpperCase() + text.substr(1).toLowerCase();
  });
};

export function generateRandom4DigitNumber() {
  const min = 1000; // Minimum 4-digit number (inclusive)
  const max = 9999; // Maximum 4-digit number (inclusive)
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function calculatePercentage(initialPrice, percentage) {
  return (initialPrice * percentage) / 100;
}
