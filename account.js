const express = require("express");
const router = express.Router();
const axios = require("axios");
const fs = require("fs");
const path = require('path');
const ACCOUNT_HOST =
  process.env.ACCOUNT_APP_SERVICE_SERVICE_HOST || "localhost";
const ACCOUNT_PORT = process.env.ACCOUNT_APP_SERVICE_SERVICE_PORT || 8082;

router.get("/", async (req, res) => {
  res.send("Good");
});

let upload_table = {};

router.post("/create_post", express.raw({limit:"20mb"}), async (req, res) => {
  const upload_id = req.headers["upload-id"];
  const totalChunks = parseInt(req.headers["total-chunks"]);
  const currentChunkNumber = parseInt(req.headers["current-chunk-number"]);
  if (!(upload_id in upload_table)) {
    upload_table[upload_id] = {
      chunksProcessed: 0,
      totalChunks,
    };

    // Initiate S3 multipart upload
    

  }
  upload_table[upload_id][currentChunkNumber] = req.body;
  upload_table[upload_id].chunksProcessed =+ 1;

  const fileName = path.join(__dirname, '/files/', upload_id);
  fs.open(fileName, 'w+', (error, fd)=>{
    if (error) {
      console.log("here")
      console.log(error)
      return 
    } else {
      fs.write(fd, upload_table[upload_id][0], (error, written, buffer)=>{
        console.log(error)
        console.log(fs.written)
        console.log(buffer)
      })
    }
  })

  /*
  if (upload_table[upload_id].chunksProcessed == totalChunks) {
    console.log("begin construction")
    const fileStream = fs.createWriteStream(__dirname + '/files/' + upload_id);
    for (ithChunk = 0; ithChunk < totalChunks; ++ithChunk) {
      fileStream.write(upload_table[upload_id][ithChunk]);
    }

    upload_table[upload_id]["0"]
  }
  */
  console.log(upload_table)
  res.sendStatus(206);
  try {
    /*
    const accountRes = await axios.get(
      `http://${ACCOUNT_HOST}:${ACCOUNT_PORT}/studio/upload`, {
        ...req.body
      }
    );
    res.status(200).send(accountRes.data)
    */
  } catch (error) {
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
});

router.post("/studio/sell_item", async (req, res) => {});

module.exports = router;
