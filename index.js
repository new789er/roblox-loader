require("dotenv").config();
const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

app.post("/upload", async (req, res) => {
  const { name, data } = req.body;

  if (!name || !data) {
    return res.status(400).send("Missing 'name' or 'data'");
  }

  try {
    const response = await axios.post(
      `https://apis.roblox.com/assets/v1/assets`,
      {
        assetType: "Model",
        name: name,
        description: "Uploaded via Open Cloud",
        isPublic: false,
        creationContext: {
          creatorType: "User",
          creatorTargetId: process.env.USER_ID
        }
      },
      {
        headers: {
          "x-api-key": process.env.API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    const assetId = response.data.assetId;

    // Upload model data
    await axios.post(
      `https://apis.roblox.com/assets/v1/assets/${assetId}/versions`,
      Buffer.from(data, "base64"),
      {
        headers: {
          "x-api-key": process.env.API_KEY,
          "Content-Type": "application/octet-stream"
        }
      }
    );

    res.send({ success: true, id: assetId });
  } catch (err) {
    console.error(err);
    res.status(500).send("Upload failed");
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
