export function addDaysToCurrentDate(daysToAdd) {
  const currentDate = new Date();
  const resultDate = new Date(currentDate);
  resultDate.setDate(currentDate.getDate() + daysToAdd);
  return resultDate;
}

export const dateStringToReadableDate = (dateString) => {
  const date = new Date(dateString);
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return date.toLocaleString(undefined, options);
};
