"use strict";

const OSS = require("ali-oss");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const axios = require("axios");
const path = require("path");

const winston = require.main.require("winston");
const nconf = require.main.require("nconf");
const gm = require("gm");

const im = gm.subClass({ imageMagick: true });
const meta = require.main.require("./src/meta");
const db = require.main.require("./src/database");
const routeHelpers = require.main.require("./src/routes/helpers");
const fileModule = require.main.require("./src/file");

const Package = require("./package.json");

const plugin = module.exports;

let client = null;
const settings = {
  accessKeyId: process.env.OSS_ACCESS_KEY_ID || undefined,
  secretAccessKey: process.env.OSS_ACCESS_KEY_SECRET || undefined,
  region: process.env.OSS_DEFAULT_REGION || "oss-cn-hongkong",
  bucket: process.env.OSS_UPLOADS_BUCKET || undefined,
  path: process.env.OSS_UPLOADS_PATH || undefined,
};

let accessKeyIdFromDb = false;
let secretAccessKeyFromDb = false;

function fetchSettings(callback) {
  db.getObjectFields(Package.name, Object.keys(settings), (err, newSettings) => {
    if (err) {
      winston.error(err.message);
      if (typeof callback === "function") {
        callback(err);
      }
      return;
    }

    accessKeyIdFromDb = false;
    secretAccessKeyFromDb = false;

    if (newSettings.accessKeyId) {
      settings.accessKeyId = newSettings.accessKeyId;
      accessKeyIdFromDb = true;
    } else {
      settings.accessKeyId = process.env.OSS_ACCESS_KEY_ID || undefined;
    }

    if (newSettings.secretAccessKey) {
      settings.secretAccessKey = newSettings.secretAccessKey;
      secretAccessKeyFromDb = true;
    } else {
      settings.secretAccessKey = process.env.OSS_ACCESS_KEY_SECRET || undefined;
    }

    if (!newSettings.bucket) {
      settings.bucket = process.env.OSS_UPLOADS_BUCKET || "";
    } else {
      settings.bucket = newSettings.bucket;
    }

    if (!newSettings.host) {
      settings.host = process.env.OSS_UPLOADS_HOST || "";
    } else {
      settings.host = newSettings.host;
    }

    if (!newSettings.path) {
      settings.path = process.env.OSS_UPLOADS_PATH || "";
    } else {
      settings.path = newSettings.path;
    }

    if (!newSettings.region) {
      settings.region = process.env.OSS_DEFAULT_REGION || "oss-cn-hongkong";
    } else {
      settings.region = newSettings.region;
    }

    if (settings.accessKeyId && settings.secretAccessKey && settings.region && settings.bucket) {
      client = new OSS({
        region: settings.region,
        accessKeyId: settings.accessKeyId,
        accessKeySecret: settings.secretAccessKey,
        bucket: settings.bucket,
      });
    }

    if (typeof callback === "function") {
      callback();
    }
  });
}

function OSSClient() {
  if (!client) {
    fetchSettings();
  }

  return client;
}

function makeError(err) {
  if (err instanceof Error) {
    err.message = `${Package.name} :: ${err.message}`;
  } else {
    err = new Error(`${Package.name} :: ${err}`);
  }

  winston.error(err.message);
  return err;
}

plugin.activate = function (data) {
  if (data.id === "nodebb-plugin-alioss-uploads") {
    fetchSettings();
  }
};

plugin.deactivate = function (data) {
  if (data.id === "nodebb-plugin-alioss-uploads") {
    client = null;
  }
};

plugin.load = function (params, callback) {
  fetchSettings((err) => {
    if (err) {
      winston.error(err.message);
      return callback(err);
    }
    const adminRoute = "/admin/plugins/alioss-uploads";
    const { router, middleware } = params;
    routeHelpers.setupAdminPageRoute(router, adminRoute, renderAdmin);

    router.post(`/api${adminRoute}/osssettings`, middleware.applyCSRF, ossSettings);
    router.post(`/api${adminRoute}/credentials`, middleware.applyCSRF, credentials);

    callback();
  });
};

function renderAdmin(req, res) {
  let forumPath = nconf.get("url");
  if (forumPath.split("").reverse()[0] !== "/") {
    forumPath += "/";
  }
  const data = {
    title: "AliOSS Uploads",
    bucket: settings.bucket,
    host: settings.host,
    path: settings.path,
    forumPath: forumPath,
    region: settings.region,
    accessKeyId: (accessKeyIdFromDb && settings.accessKeyId) || "",
    secretAccessKey: (secretAccessKeyFromDb && settings.secretAccessKey) || "",
  };

  res.render("admin/plugins/alioss-uploads", data);
}

function ossSettings(req, res, next) {
  const data = req.body;
  const newSettings = {
    bucket: data.bucket || "",
    host: data.host || "",
    path: data.path || "",
    region: data.region || "oss-cn-hongkong",
  };

  saveSettings(newSettings, res, next);
}

function credentials(req, res, next) {
  const data = req.body;
  const newSettings = {
    accessKeyId: data.accessKeyId || "",
    secretAccessKey: data.secretAccessKey || "",
  };

  saveSettings(newSettings, res, next);
}

function saveSettings(settings, res, next) {
  db.setObject(Package.name, settings, (err) => {
    if (err) {
      return next(makeError(err));
    }

    fetchSettings();
    res.json("Saved!");
  });
}

function isExtensionAllowed(filePath, allowed) {
  const extension = path.extname(filePath).toLowerCase();
  return !(allowed.length > 0 && (!extension || extension === "." || !allowed.includes(extension)));
}

plugin.uploadImage = function (data, callback) {
  const { image } = data;

  if (!image) {
    winston.error("invalid image");
    return callback(new Error("invalid image"));
  }

  // check filesize vs. settings
  if (image.size > parseInt(meta.config.maximumFileSize, 10) * 1024) {
    winston.error(`error:file-too-big, ${meta.config.maximumFileSize}`);
    return callback(new Error(`[[error:file-too-big, ${meta.config.maximumFileSize}]]`));
  }

  const type = image.url ? "url" : "file";
  const allowed = fileModule.allowedExtensions();

  if (type === "file") {
    if (!image.path) {
      return callback(new Error("invalid image path"));
    }

    if (!isExtensionAllowed(image.path, allowed)) {
      return callback(new Error(`[[error:invalid-file-type, ${allowed.join("&#44; ")}]]`));
    }

    fs.readFile(image.path, (err, buffer) => {
      uploadToOSS(image.name, err, buffer, callback);
    });
  } else {
    if (!isExtensionAllowed(image.url, allowed)) {
      return callback(new Error(`[[error:invalid-file-type, ${allowed.join("&#44; ")}]]`));
    }

    const filename = image.url.split("/").pop();

    const imageDimension = parseInt(meta.config.profileImageDimension, 10) || 128;

    // Resize image.
    im(axios.get(image.url), filename)
      .resize(`${imageDimension}^`, `${imageDimension}^`)
      .stream((err, stdout) => {
        if (err) {
          return callback(makeError(err));
        }

        // This is sort of a hack - We"re going to stream the gm output to a buffer and then upload.
        // See https://github.com/aws/aws-sdk-js/issues/94
        let buf = Buffer.alloc(0);
        stdout.on("data", (d) => {
          buf = Buffer.concat([buf, d]);
        });
        stdout.on("end", () => {
          uploadToOSS(filename, null, buf, callback);
        });
      });
  }
};

plugin.uploadFile = function (data, callback) {
  const { file } = data;

  if (!file) {
    return callback(new Error("invalid file"));
  }

  if (!file.path) {
    return callback(new Error("invalid file path"));
  }

  // check filesize vs. settings
  if (file.size > parseInt(meta.config.maximumFileSize, 10) * 1024) {
    winston.error(`error:file-too-big, ${meta.config.maximumFileSize}`);
    return callback(new Error(`[[error:file-too-big, ${meta.config.maximumFileSize}]]`));
  }

  const allowed = fileModule.allowedExtensions();
  if (!isExtensionAllowed(file.path, allowed)) {
    return callback(new Error(`[[error:invalid-file-type, ${allowed.join("&#44; ")}]]`));
  }

  fs.readFile(file.path, (err, buffer) => {
    uploadToOSS(file.name, err, buffer, callback);
  });
};

function uploadToOSS(filename, err, buffer, callback) {
  if (err) {
    return callback(makeError(err));
  }

  let ossPath;
  if (settings.path && settings.path.length > 0) {
    ossPath = settings.path;

    if (!ossPath.match(/\/$/)) {
      // Add trailing slash
      ossPath += "/";
    }
  } else {
    ossPath = "/";
  }

  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const todayStr = `${today.getFullYear()}${month}${day}`; // 使用日期爲一級文件夾
  let ossKeyPath = ossPath.replace(/^\//, ""); // Key Path should not start with slash.
  ossKeyPath = path.join(ossKeyPath, todayStr, `${uuidv4()}${path.extname(filename)}`);

  const ossClient = OSSClient();
  ossClient.put(ossKeyPath, buffer).then(
    (res) => {
      // amazon has https enabled, we use it by default
      let host = `https://${settings.bucket}.${settings.region}.aliyuncs.com`;
      if (settings.host && settings.host.length > 0) {
        host = settings.host;
        // host must start with http or https
        if (!host.startsWith("http")) {
          host = `http://${host}`;
        }
      }

      callback(null, {
        name: filename,
        url: `${host}/${ossKeyPath}`,
      });
    },
    (err) => {
      return callback(makeError(err));
    }
  );
}

plugin.admin = {};

plugin.admin.menu = function (custom_header, callback) {
  custom_header.plugins.push({
    route: "/plugins/alioss-uploads",
    icon: "fa-envelope-o",
    name: "AliOSS Uploads",
  });

  callback(null, custom_header);
};
