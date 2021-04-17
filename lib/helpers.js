import crypto from "crypto";
import { environmentToExport as config } from "./config.js";

export const helpers = {};

helpers.hash = (str) => {
  if (typeof str === "string" && str.length > 0) {
    const hash = crypto
      .createHmac("sha256", config.hashingSecret)
      .update(str)
      .digest("hex");
    return hash;
  } else {
    return false;
  }
};

helpers.validate = () => true;

helpers.parseJSONToObject = (str) => {
  try {
    const obj = JSON.parse(str);
    return obj;
  } catch (error) {
    return {};
  }
};

helpers.createRandomString = (len) => {
  let strLength = typeof len === "number" && len > 0 ? len : false;
  if (strLength) {
    const validCharacters = "abcdefghijklmnopqrstuvwxyz0123456789";

    let rngStr = "";

    while (strLength-- > 1) {
      const rngChar = validCharacters.charAt(
        Math.floor(Math.random() * validCharacters.length)
      );

      rngStr += rngChar;
    }
    return rngStr;
  } else {
    return false;
  }
};
