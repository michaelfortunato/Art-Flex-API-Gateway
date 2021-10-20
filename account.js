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

let upload_table = {};

const initUpload = async (req, res) => {
  const upload_id = req.headers["upload-id"];
  const totalChunks = parseInt(req.headers["total-chunks"]);
  const currentChunkNumber = parseInt(req.headers["current-chunk-number"]);

  if (upload_id in upload_table) {
    req.status(500).send({statusMessage:"AWS multiupload currently in progress."})
  }

  upload_table[upload_id] = {
      chunksProcessed: 0,
      totalChunks,
      chunks: {}
    };
 

  const createMultipartUpload = new CreateMultipartUploadCommand({
    Bucket: "private.assets.art-flex.co",
    ContentType: "application/octet-stream",
    Key: upload_id,
  });

  const { UploadId: awsUploadId } = await req.app.locals.s3_client.send(
    createMultipartUpload
  );

};
const uploadPart = async (req, res, next) => {};
const completeUpload = async (req, res, next) => {};

router.post(
  "/create_post",
  express.raw({ limit: "20mb" }),
  async (req, res) => {
    try {
      //console.log(upload_table)
      const upload_id = req.headers["upload-id"];
      const totalChunks = parseInt(req.headers["total-chunks"]);
      const currentChunkNumber = parseInt(req.headers["current-chunk-number"]);
      if (!(upload_id in upload_table)) {
        upload_table[upload_id] = {
          chunksProcessed: 0,
          totalChunks,
          chunks: {},
          awsUploadId: null,
        };
        // Initiate S3 multipart upload
        const createMultipartUpload = new CreateMultipartUploadCommand({
          Bucket: "private.assets.art-flex.co",
          ContentType: "application/octet-stream",
          Key: upload_id,
        });
        try {
          const { UploadId: awsUploadId } = await req.app.locals.s3_client.send(
            createMultipartUpload
          );
          upload_table[upload_id].awsUploadId = awsUploadId;
        } catch (error) {
          console.log("error");
        }
      }
      const uploadPartCommand = new UploadPartCommand({
        Bucket: "private.assets.art-flex.co",
        UploadId: upload_table[upload_id].awsUploadId,
        Key: upload_id,
        PartNumber: currentChunkNumber,
        Body: req.body,
      });
      const { ETag } = await req.app.locals.s3_client.send(uploadPartCommand);
      upload_table[upload_id].chunksProcessed += 1;
      upload_table[upload_id].chunks[currentChunkNumber] = ETag;

      // Check to see if we can complete the upload
      if (upload_table[upload_id].chunksProcessed === totalChunks) {
        console.log(
          Object.keys(upload_table[upload_id].chunks).map((key) => ({
            PartNumber: parseInt(key),
            ETag: upload_table[upload_id].chunks[key],
          }))
        );

        const completeMultipartUpload = new CompleteMultipartUploadCommand({
          Bucket: "private.assets.art-flex.co",
          Key: upload_id,
          UploadId: upload_table[upload_id].awsUploadId,
          MultipartUpload: {
            Parts: Object.keys(upload_table[upload_id].chunks).map((key) => ({
              PartNumber: parseInt(key),
              ETag: upload_table[upload_id].chunks[key],
            })),
          },
        });

        const completeResponse = await req.app.locals.s3_client.send(
          completeMultipartUpload
        );
        res.sendStatus(200);
      } else {
        res.sendStatus(206);
      }
    } catch (error) {
      //console.log(error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        res.status(error.response.status).send(error.response.data);
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        res.status(500).send({ statusMessage: "Internal server error" });
      } else {
        // Something happened in setting up the request that triggered an Error
        res.status(500).send({ statusMessage: "Internal server error" });
      }
    }
  }
);

router.post("/studio/sell_item", async (req, res) => {});

module.exports = router;
