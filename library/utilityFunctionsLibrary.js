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

export const spreadAndOmitKeys = (sourceObject, keysToOmit) => {
  // Spread key-value pairs into a new object
  const spreadObject = { ...sourceObject };

  // Omit specified keys from the new object
  keysToOmit.forEach((key) => delete spreadObject[key]);

  return spreadObject;
};

export function removeDuplicatesAndSumPrices(arr) {
  const uniqueMap = new Map();

  for (const obj of arr) {
    const key = obj.sellerId.toString(); // Convert sellerId to string for consistency
    if (uniqueMap.has(key)) {
      // If the key (sellerId) already exists, add the price to the existing object
      uniqueMap.get(key).price += obj.price;
    } else {
      // If the key is not in the map, create a new entry
      uniqueMap.set(key, { ...obj });
    }
  }

  // Convert the map values back to an array
  const uniqueArray = Array.from(uniqueMap.values());

  return uniqueArray;
}

export const getFirst_x_ItemsOfArray = (array, sliceBy) => {
  return array.slice(0, sliceBy);
};

export class idGenerator {
  constructor() {
    this.usedIDs = null;
  }

  async generateTrackingID(TrackingIDModel, orderId) {
    while (true) {
      const trackingID = `TFY${this.generateRandomID()}`;
      const isUsed = await TrackingIDModel.findOne({ tracking_id: trackingID });

      if (!isUsed) {
        await TrackingIDModel.create({
          tracking_id: trackingID,
          order: orderId,
        });
        return trackingID;
      }
      console.log("Tracking ID exists, so generating another...");
    }
  }

  generateRandomID() {
    const characters = "ABCDEFGHIJKLMNPQRSTUVWXYZ123456789"; //excluding 0 and O
    let trackingID = "";
    for (let i = 0; i < 5; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      trackingID += characters.charAt(randomIndex);
    }
    return trackingID;
  }
}
