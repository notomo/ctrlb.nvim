import { setupServerClient } from "./setup";
import { sync as mkdir } from "mkdirp";
import { chmodSync } from "fs";
import { createReadStream, writeFileSync } from "fs";
import { Extract } from "unzip";
import { get } from "request";
import { RequestCallback } from "request";

const releaseTag = "v0.0.4";
const binaryDirectory = "bin";

const unarchive = (
  zipPath: string,
  binaryDirectory: string,
  callback: Function
) => {
  createReadStream(zipPath)
    .pipe(Extract({ path: binaryDirectory }))
    .on("close", () => callback());
};

const getFile = (url: string, callback: RequestCallback) => {
  get(url, { followAllRedirects: true, encoding: null }, callback);
};

setupServerClient(
  process.platform,
  releaseTag,
  binaryDirectory,
  mkdir,
  chmodSync,
  unarchive,
  writeFileSync,
  getFile,
  console.log,
  console.error
);
