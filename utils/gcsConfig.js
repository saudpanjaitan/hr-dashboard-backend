const { Storage } = require("@google-cloud/storage");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

const credentials = JSON.parse(process.env.GCLOUD_KEY_FILE_CONTENT);
const storage = new Storage({
  projectId: process.env.GCLOUD_PROJECT_ID,
  credentials: credentials,
});

const bucket = storage.bucket(process.env.GCLOUD_STORAGE_BUCKET);

module.exports = bucket;
