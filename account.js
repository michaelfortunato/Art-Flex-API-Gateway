const express = require("express");
const router = express.Router();
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const {
  GetObjectCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
} = require("@aws-sdk/client-s3");
const { route } = require("./signup");
const ACCOUNT_HOST =
  process.env.ACCOUNT_APP_SERVICE_SERVICE_HOST || "localhost";
const ACCOUNT_PORT = process.env.ACCOUNT_APP_SERVICE_SERVICE_PORT || 8082;

router.get("/", async (req, res) => {
  try {
    const command = new GetObjectCommand({
      Bucket: "private.assets.art-flex.co",
      Key: "gary.jpeg",
    });
    const url = await getSignedUrl(req.app.locals.s3_client, command, {
      expiresIn: 3600,
    });
    res.send({ url });
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

let uploadTable = {};

const createUpload = async (req, res) => {
  try {
    const uploadId = req.headers["x-upload-id"];
    const totalChunks = parseInt(req.headers["x-total-chunks"]);

    if (uploadId in uploadTable) {
      res
        .status(500)
        .send({ statusMessage: "AWS multiupload currently in progress." });
    }

    uploadTable[uploadId] = {
      chunksProcessed: 0,
      totalChunks,
      chunks: {},
      awsUploadId: null,
    };

    const createMultipartUpload = new CreateMultipartUploadCommand({
      Bucket: "private.assets.art-flex.co",
      ContentType: "application/octet-stream",
      Key: uploadId,
    });
    const { UploadId: awsUploadId } = await req.app.locals.s3_client.send(
      createMultipartUpload
    );
    uploadTable[uploadId].awsUploadId = awsUploadId;
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
};
const uploadPart = async (req, res, next) => {
  try {
    const uploadId = req.headers["x-upload-id"];
    const totalChunks = parseInt(req.headers["x-total-chunks"]);
    const currentChunkNumber = parseInt(req.headers["x-current-chunk-number"]);

    if (
      !("awsUploadId" in uploadTable[uploadId]) ||
      uploadTable[uploadId].awsUploadId === null
    ) {
      res.sendStatus(500);
    }
    const uploadPartCommand = new UploadPartCommand({
      Bucket: "private.assets.art-flex.co",
      UploadId: uploadTable[uploadId].awsUploadId,
      Key: uploadId,
      PartNumber: currentChunkNumber,
      Body: req.body,
    });
    const { ETag } = await req.app.locals.s3_client.send(uploadPartCommand);

    uploadTable[uploadId].chunksProcessed += 1;
    uploadTable[uploadId].chunks[currentChunkNumber] = ETag;

    if (uploadTable[uploadId].chunksProcessed === totalChunks) {
      next();
    } else {
      res.sendStatus(206);
    }
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
};
const completeUpload = async (req, res) => {
  try {
    const uploadId = req.headers["x-upload-id"];
    const completeMultipartUpload = new CompleteMultipartUploadCommand({
      Bucket: "private.assets.art-flex.co",
      Key: uploadId,
      UploadId: uploadTable[uploadId].awsUploadId,
      MultipartUpload: {
        Parts: Object.keys(uploadTable[uploadId].chunks).map((key) => ({
          PartNumber: parseInt(key),
          ETag: uploadTable[uploadId].chunks[key],
        })),
      },
    });
    const completeResponse = await req.app.locals.s3_client.send(
      completeMultipartUpload
    );
    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(500);
  }
};

router.post("/createUpload", createUpload);

router.post(
  "/uploadPart",
  express.raw({ limit: "20mb" }),
  uploadPart,
  completeUpload
);

router.post("/studio/sell_item", async (req, res) => {});

module.exports = router;
