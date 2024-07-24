const express = require("express");
const router = express.Router();
const Hiring = require("../models/Hiring");
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

// Function to generate unique hiring ID
async function generateHiringId() {
  const lastRecord = await Hiring.findOne().sort({ hiringId: -1 });
  let nextIdNumber = 1;

  if (lastRecord && lastRecord.hiringId) {
    const lastIdNumber = parseInt(lastRecord.hiringId.slice(-4), 10);
    nextIdNumber = lastIdNumber + 1;
  }

  const nextId = `HIR${String(nextIdNumber).padStart(4, "0")}`;
  return nextId;
}

// Get All Hiring Records
router.get("/", async (req, res) => {
  try {
    const hiringRecords = await Hiring.find();
    res.json(hiringRecords);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Hiring Record by Hiring ID
router.get("/:hiringId", async (req, res) => {
  try {
    const hiringRecord = await Hiring.findOne({
      hiringId: req.params.hiringId,
    });
    if (!hiringRecord)
      return res.status(404).json({ message: "Hiring record not found" });
    res.json(hiringRecord);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create Hiring Record
router.post("/", upload.single("lampiran_cv"), async (req, res) => {
  try {
    const hiringId = await generateHiringId();
    const file = req.file;
    let fileUrl = "";

    if (file) {
      const timestamp = moment().format("YYYYMMDD-HHmmss");
      const sanitizedFilename = file.originalname.replace(/\s+/g, "-");
      const sanitizedNamaKandidat = req.body.nama_kandidat.replace(/\s+/g, "-");
      const blob = bucket.file(
        `Hiring/${hiringId}-${sanitizedNamaKandidat}/${timestamp}-${sanitizedFilename}`
      );
      const blobStream = blob.createWriteStream();

      blobStream.on("error", (err) => {
        console.error(err);
        res.status(500).json({ message: err.message });
      });

      blobStream.on("finish", async () => {
        fileUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

        const newHiringRecord = new Hiring({
          hiringId,
          ...req.body,
          lampiran_cv: fileUrl,
        });

        await newHiringRecord.save();
        res.status(201).json(newHiringRecord);
      });

      blobStream.end(file.buffer);
    } else {
      const newHiringRecord = new Hiring({
        hiringId,
        ...req.body,
      });

      await newHiringRecord.save();
      res.status(201).json(newHiringRecord);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update Hiring Record by Hiring ID
router.put("/:hiringId", upload.single("lampiran_cv"), async (req, res) => {
  try {
    const file = req.file;
    let fileUrl = "";

    if (file) {
      const timestamp = moment().format("YYYYMMDD-HHmmss");
      const sanitizedFilename = file.originalname.replace(/\s+/g, "-");
      const sanitizedNamaKandidat = req.body.nama_kandidat.replace(/\s+/g, "-");
      const blob = bucket.file(
        `Hiring/${req.params.hiringId}-${sanitizedNamaKandidat}/${timestamp}-${sanitizedFilename}`
      );
      const blobStream = blob.createWriteStream();

      blobStream.on("error", (err) => {
        console.error(err);
        res.status(500).json({ message: err.message });
      });

      blobStream.on("finish", async () => {
        fileUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

        const updatedHiringRecord = await Hiring.findOneAndUpdate(
          { hiringId: req.params.hiringId },
          {
            ...req.body,
            lampiran_cv: fileUrl,
          },
          { new: true, runValidators: true }
        );

        if (!updatedHiringRecord) {
          return res.status(404).json({ message: "Hiring record not found" });
        }

        res.status(200).json(updatedHiringRecord);
      });

      blobStream.end(file.buffer);
    } else {
      const updatedHiringRecord = await Hiring.findOneAndUpdate(
        { hiringId: req.params.hiringId },
        {
          ...req.body,
        },
        { new: true, runValidators: true }
      );

      if (!updatedHiringRecord) {
        return res.status(404).json({ message: "Hiring record not found" });
      }

      res.status(200).json(updatedHiringRecord);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete Hiring Record by Hiring ID
router.delete("/:hiringId", async (req, res) => {
  try {
    const hiringRecord = await Hiring.findOneAndDelete({
      hiringId: req.params.hiringId,
    });

    if (!hiringRecord) {
      return res.status(404).json({ message: "Hiring record not found" });
    }

    const sanitizedNamaKandidat = hiringRecord.nama_kandidat.replace(
      /\s+/g,
      "-"
    );
    const filePath = `Hiring/${hiringRecord.hiringId}-${sanitizedNamaKandidat}`;
    const [files] = await bucket.getFiles({ prefix: filePath });

    files.forEach(async (file) => {
      await file.delete();
    });

    res.status(200).json({ message: "Hiring record deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
