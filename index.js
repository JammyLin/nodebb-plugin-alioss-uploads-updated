"use strict";

const winston = require.main.require("winston");
const nconf = require.main.require("nconf");

const routeHelpers = require.main.require("./src/routes/helpers");

const { getSettings, updateSettings, getDBOptions } = require("./src/db");
const { unload, refreshClient, load } = require("./src/oss");

const plugin = module.exports;

plugin.deactivate = (data) => {
  if (data.id === "nodebb-plugin-alioss-uploads") {
    unload();
  }
};

plugin.load = async (params) => {
  const adminRoute = "/admin/plugins/alioss-uploads";
  const { router, middleware } = params;
  routeHelpers.setupAdminPageRoute(router, adminRoute, renderAdmin);

  router.post(`/api${adminRoute}/osssettings`, middleware.applyCSRF, ossSettings);
  router.post(`/api${adminRoute}/credentials`, middleware.applyCSRF, credentials);

  try {
    load();
    await refreshClient();
  } catch (err) {
    winston.error(err.message);
  }
};

async function renderAdmin(req, res) {
  const settings = await getSettings();
  let forumPath = nconf.get("url");
  if (forumPath.split("").reverse()[0] !== "/") {
    forumPath += "/";
  }
  const dbOptions = getDBOptions();
  const data = {
    title: "AliOSS Uploads",
    bucket: settings.bucket,
    host: settings.host,
    path: settings.path,
    forumPath: forumPath,
    region: settings.region,
    accessKeyId: (dbOptions.accessKeyIdFromDb && settings.accessKeyId) || "",
    secretAccessKey: (dbOptions.secretAccessKeyFromDb && settings.secretAccessKey) || "",
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

  updateSettings(newSettings, res, next);
}

function credentials(req, res, next) {
  const data = req.body;
  const newSettings = {
    accessKeyId: data.accessKeyId || "",
    secretAccessKey: data.secretAccessKey || "",
  };

  updateSettings(newSettings, res, next);
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

require("./src/hook")(plugin);
