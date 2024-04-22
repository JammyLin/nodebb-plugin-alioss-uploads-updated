"use strict";

const fs = require("fs");
const im = require("gm").subClass({ imageMagick: true });

const fileModule = require.main.require("./src/file");
const meta = require.main.require("./src/meta");

const { isExtensionAllowed, getImageSize, imgToBuffer } = require("./utils");
const { uploadToOSS } = require("./oss");
const { makeError } = require("./utils");

module.exports = function (plugin) {
  plugin.uploadImage = async (data) => {
    const { image, folder, uid } = data;

    if (!image) throw makeError("Image provided was invalid.");

    // check filesize vs. settings
    if (image.size > parseInt(meta.config.maximumFileSize, 10) * 1024)
      throw makeError(`[[error:file-too-big, ${meta.config.maximumFileSize}]]`);

    const type = image.url ? "url" : "file";
    const allowed = fileModule.allowedExtensions();

    if (type === "file") {
      if (!image.path) throw makeError("invalid image path");
      if (!isExtensionAllowed(image.path, allowed))
        throw makeError(`[[error:invalid-file-type, ${allowed.join("&#44; ")}]]`);

      let shouldCheckWidth = true;
      const isSVG = image.type === "image/svg+xml";
      if (
        isSVG ||
        meta.config.resizeImageWidth === 0 ||
        meta.config.resizeImageWidthThreshold === 0 ||
        meta.config.resizeImageWidth > meta.config.resizeImageWidthThreshold
      ) {
        shouldCheckWidth = false;
      }

      try {
        const imgBuffer = fs.readFileSync(image.path);
        const fileObj = await uploadToOSS(image.name, imgBuffer, folder, uid);
        if (!shouldCheckWidth) return fileObj;

        const img = im(imgBuffer);
        const { width } = await getImageSize(img);
        if (width >= meta.config.resizeImageWidthThreshold) {
          const filename = fileObj.url.split("/").pop();
          const resizedFileBuffer = await imgToBuffer(
            img.quality(meta.config.resizeImageQuality).resize(meta.config.resizeImageWidth)
          );
          return uploadToOSS(
            image.name,
            resizedFileBuffer,
            folder,
            uid,
            fileModule.appendToFileName(filename, "-resized")
          );
        }
      } catch (error) {
        throw makeError(error);
      }
    } else {
      if (!isExtensionAllowed(image.url, allowed)) {
        throw makeError(`[[error:invalid-file-type, ${allowed.join("&#44; ")}]]`);
      }
      const filename = image.url.split("/").pop();
      const imageDimension = parseInt(meta.config.profileImageDimension, 10) || 128;

      const response = await axios.get(image.url, { responseType: "arraybuffer" });
      const fileBuffer = await imgToBuffer(
        im(Buffer.from(response.data, "binary"), filename).resize(`${imageDimension}^`, `${imageDimension}^`) // Resize image.
      );
      return uploadToOSS(filename, fileBuffer, folder, uid);
    }
  };

  plugin.uploadFile = async (data) => {
    const { file, folder, uid } = data;

    if (!file) throw makeError("invalid file");
    if (!file.path) throw makeError("invalid file path");

    // check filesize vs. settings
    if (file.size > parseInt(meta.config.maximumFileSize, 10) * 1024)
      throw makeError(`[[error:file-too-big, ${meta.config.maximumFileSize}]]`);

    const allowed = fileModule.allowedExtensions();
    if (!isExtensionAllowed(file.path, allowed))
      throw makeError(`[[error:invalid-file-type, ${allowed.join("&#44; ")}]]`);

    try {
      const fileBuffer = fs.readFileSync(file.path);
      return await uploadToOSS(file.name, fileBuffer, folder, uid);
    } catch (error) {
      throw makeError(error);
    }
  };
};
