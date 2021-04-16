import fs from "fs";
import path from "path";
import { helpers } from "./helpers.js";

const __dirname = path
  .join(path.dirname(decodeURI(new URL(import.meta.url).pathname)))
  .replace(/^\\([A-Z]:\\)/, "$1");

export const _data = {};

_data.baseDir = path.join(__dirname, "/../.data/").replace(/\\/g, "/");

_data.create = (dir, file, data) => {
  const filePath = getFilePath(dir, file);
  try {
    const newFile = fs.openSync(filePath, "wx");

    const stringData = JSON.stringify(data);

    fs.writeFileSync(filePath, stringData);

    fs.closeSync(newFile);

    return true;
  } catch (error) {
    return error.message;
  }
};

// Read a file
//? Return data string if exists
//? Return ENOENT if doesn't exist
_data.read = (dir, file) => {
  const filePath = getFilePath(dir, file);

  try {
    const readFile = fs.readFileSync(filePath, "utf-8");
    return helpers.parseJSONToObject(readFile);
  } catch (error) {
    return error.code;
  }
};

_data.update = (dir, file, data) => {
  const filePath = getFilePath(dir, file);

  try {
    const stringData = JSON.stringify(data);

    const openFile = fs.openSync(filePath, "r+");

    fs.ftruncateSync(openFile);

    fs.writeFileSync(openFile, stringData);

    fs.closeSync(openFile);

    return true;
  } catch (error) {
    return error.message;
  }
};

_data.delete = (dir, file) => {
  const filePath = getFilePath(dir, file);

  try {
    fs.unlinkSync(filePath);
    return true;
  } catch (error) {
    return error.message;
  }
};

const getFilePath = (dir, file) => {
  return `${_data.baseDir}${dir}/${file}.json`;
};
