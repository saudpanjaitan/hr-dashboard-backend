const express = require("express");
const router = express.Router();
const ESS = require("../models/ESS");
const multer = require("multer");
const { Storage } = require("@google-cloud/storage");
const moment = require("moment");
require("dotenv").config();

// Setup Google Cloud Storage
const storage = new Storage({
  projectId: process.env.GCLOUD_PROJECT_ID,
  credentials: JSON.parse(process.env.GCLOUD_KEY_FILE_CONTENT),
});
const bucket = storage.bucket(process.env.GCLOUD_STORAGE_BUCKET);

// Setup multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
});

// Function to generate unique ESS ID
async function generateEssId() {
  const lastRecord = await ESS.findOne().sort({ essId: -1 });
  let nextIdNumber = 1;

  if (lastRecord && lastRecord.essId) {
    const lastIdNumber = parseInt(lastRecord.essId.slice(-4), 10);
    nextIdNumber = lastIdNumber + 1;
  }

  const nextId = `ESS${String(nextIdNumber).padStart(4, "0")}`;
  return nextId;
}

// Get All ESS
router.get("/", async (req, res) => {
  try {
    const essRecords = await ESS.find();
    res.json(essRecords);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get ESS by ID
router.get("/:essId", async (req, res) => {
  try {
    const essRecord = await ESS.findOne({ essId: req.params.essId });
    if (!essRecord)
      return res.status(404).json({ message: "ESS record not found" });
    res.json(essRecord);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create ESS
router.post("/", upload.single("lampiran"), async (req, res) => {
  try {
    const essId = await generateEssId();
    const file = req.file;
    let fileUrl = "";

    if (file) {
      const timestamp = moment().format("YYYYMMDD-HHmmss");
      const sanitizedFilename = file.originalname.replace(/\s+/g, "-");
      const sanitizedNamaDokumen = req.body.nama_dokumen.replace(/\s+/g, "-");
      const blob = bucket.file(
        `ESS/${essId}-${sanitizedNamaDokumen}/${timestamp}-${sanitizedFilename}`
      );
      const blobStream = blob.createWriteStream();

      blobStream.on("error", (err) => {
        console.error(err);
        res.status(500).json({ message: err.message });
      });

      blobStream.on("finish", async () => {
        fileUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

        const newESS = new ESS({
          essId,
          ...req.body,
          lampiran: fileUrl,
        });

        await newESS.save();
        res.status(201).json(newESS);
      });

      blobStream.end(file.buffer);
    } else {
      const newESS = new ESS({
        essId,
        ...req.body,
      });

      await newESS.save();
      res.status(201).json(newESS);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update ESS by ID
router.put("/:essId", upload.single("lampiran"), async (req, res) => {
  try {
    const file = req.file;
    let fileUrl = "";

    if (file) {
      const timestamp = moment().format("YYYYMMDD-HHmmss");
      const sanitizedFilename = file.originalname.replace(/\s+/g, "-");
      const sanitizedNamaDokumen = req.body.nama_dokumen.replace(/\s+/g, "-");
      const blob = bucket.file(
        `ESS/${req.params.essId}-${sanitizedNamaDokumen}/${timestamp}-${sanitizedFilename}`
      );
      const blobStream = blob.createWriteStream();

      blobStream.on("error", (err) => {
        console.error(err);
        res.status(500).json({ message: err.message });
      });

      blobStream.on("finish", async () => {
        fileUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

        const updatedESS = await ESS.findOneAndUpdate(
          { essId: req.params.essId },
          {
            ...req.body,
            lampiran: fileUrl,
          },
          { new: true, runValidators: true }
        );

        if (!updatedESS) {
          return res.status(404).json({ message: "ESS record not found" });
        }

        res.status(200).json(updatedESS);
      });

      blobStream.end(file.buffer);
    } else {
      const updatedESS = await ESS.findOneAndUpdate(
        { essId: req.params.essId },
        {
          ...req.body,
        },
        { new: true, runValidators: true }
      );

      if (!updatedESS) {
        return res.status(404).json({ message: "ESS record not found" });
      }

      res.status(200).json(updatedESS);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete ESS by ID
router.delete("/:essId", async (req, res) => {
  try {
    const essRecord = await ESS.findOneAndDelete({ essId: req.params.essId });

    if (!essRecord) {
      return res.status(404).json({ message: "ESS record not found" });
    }

    const sanitizedNamaDokumen = essRecord.nama_dokumen.replace(/\s+/g, "-");
    const filePath = `ESS/${essRecord.essId}-${sanitizedNamaDokumen}`;
    const [files] = await bucket.getFiles({ prefix: filePath });

    files.forEach(async (file) => {
      await file.delete();
    });

    res.status(200).json({ message: "ESS record deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
