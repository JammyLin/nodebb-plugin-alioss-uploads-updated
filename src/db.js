"use strict";

const db = require.main.require("./src/database");

const { makeError } = require("./utils");

const Package = require("../package.json");

let settings = null;

let accessKeyIdFromDb = false;
let secretAccessKeyFromDb = false;

async function getSettings(refresh) {
  if (!refresh & settings) {
    return Promise.resolve(settings);
  }

  return await fetchSettings();
}

function getDefaultSettings() {
  return {
    accessKeyId: process.env.OSS_ACCESS_KEY_ID || undefined,
    secretAccessKey: process.env.OSS_ACCESS_KEY_SECRET || undefined,
    region: process.env.OSS_DEFAULT_REGION || "oss-cn-hongkong",
    bucket: process.env.OSS_UPLOADS_BUCKET || undefined,
    path: process.env.OSS_UPLOADS_PATH || undefined,
  };
}

function unload() {
  settings = null;
  accessKeyIdFromDb = false;
  secretAccessKeyFromDb = false;
}

async function fetchSettings() {
  const defaultSettings = getDefaultSettings();
  let newSettings = await db.getObjectFields(Package.name, Object.keys(defaultSettings));
  newSettings = Object.fromEntries(Object.entries(newSettings).filter(([_, v]) => !!v)); // remove empty value prevent to overwrite

  accessKeyIdFromDb = !!newSettings.accessKeyId;
  secretAccessKeyFromDb = !!newSettings.secretAccessKey;

  settings = { ...defaultSettings, ...newSettings };
  return settings;
}

async function updateSettings(settings, res, next) {
  try {
    await db.setObject(Package.name, settings);
    await fetchSettings();
    res.json("Saved!");
  } catch (err) {
    return next(makeError(err));
  }
}

function getDBOptions() {
  return { accessKeyIdFromDb, secretAccessKeyFromDb };
}

module.exports = {
  getDBOptions,
  getSettings,
  fetchSettings,
  unload,
  updateSettings,
};
