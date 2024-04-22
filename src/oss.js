"use strict";

const path = require("path");
const OSS = require("ali-oss");
const { v4: uuidv4 } = require("uuid");

const { getSettings, fetchSettings, unload: dbUnload } = require("./db");
const { makeError } = require("./utils");

let client = null;
let pluginActive = false;

async function getClient() {
  if (!pluginActive) {
    throw makeError("Ali OSS plugin called while inactive");
  }
  if (client) return client;

  await refreshClient();
  return client;
}

async function refreshClient() {
  const settings = await fetchSettings();
  if (!settings.accessKeyId || !settings.secretAccessKey || !settings.region || !settings.bucket) {
    throw makeError("Invalid OSS options");
  }
  client = new OSS({
    region: settings.region,
    accessKeyId: settings.accessKeyId,
    accessKeySecret: settings.secretAccessKey,
    bucket: settings.bucket,
  });
}

function load() {
  pluginActive = true;
}

function unload() {
  client = null;
  pluginActive = false;
  dbUnload();
}

async function uploadToOSS(filename, buffer, folder, uid, resizedFilename) {
  let ossPath;
  const settings = await getSettings();
  if (settings.path && settings.path.length > 0) {
    ossPath = settings.path;

    if (!ossPath.match(/\/$/)) {
      // Add trailing slash
      ossPath += "/";
    }
  } else {
    ossPath = "/";
  }

  let ossKeyPath = ossPath.replace(/^\//, ""); // Key Path should not start with slash.
  if (folder === "profile") {
    ossKeyPath = path.join(ossKeyPath, folder, uid.toString(), `${filename}.png`); // Already converted to PNG before trigger hook
  } else {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const todayStr = `${today.getFullYear()}${month}${day}`; // Use date as first level folder
    ossKeyPath = path.join(ossKeyPath, folder, todayStr, resizedFilename || `${uuidv4()}${path.extname(filename)}`);
  }

  const ossClient = await getClient();
  await ossClient.put(ossKeyPath, buffer);

  let host = `https://${settings.bucket}.${settings.region}.aliyuncs.com`;
  if (settings.host && settings.host.length > 0) {
    host = settings.host;
    // host must start with http or https
    if (!host.startsWith("http")) {
      host = `http://${host}`;
    }
  }
  return {
    name: path.basename(ossKeyPath),
    url: `${host}/${ossKeyPath}`,
  };
}

module.exports = {
  getClient,
  refreshClient,
  uploadToOSS,
  load,
  unload,
};
