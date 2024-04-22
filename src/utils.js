"use strict";

const path = require("path");

const winston = require.main.require("winston");

const Package = require("../package.json");

function makeError(err) {
  if (err instanceof Error) {
    err.message = `${Package.name} :: ${err.message}`;
  } else {
    err = new Error(`${Package.name} :: ${err}`);
  }

  winston.error(err.message);
  return err;
}

function isExtensionAllowed(filePath, allowed) {
  const extension = path.extname(filePath).toLowerCase();
  return !(allowed.length > 0 && (!extension || extension === "." || !allowed.includes(extension)));
}

async function getImageSize(img) {
  return new Promise((resolve, reject) => {
    img.size((err, val) => {
      if (err) return reject(makeError(err));
      resolve(val);
    });
  });
}

async function imgToBuffer(img) {
  return new Promise((resolve, reject) => {
    img.toBuffer((err, buffer) => {
      if (err) return reject(makeError(err));
      resolve(buffer);
    });
  });
}

module.exports = {
  makeError,
  isExtensionAllowed,
  getImageSize,
  imgToBuffer,
};
