const express = require("express");
const router = express.Router();
const Karyawan = require("../models/Karyawan");
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

// Function to generate unique karyawan ID
async function generateKaryawanId() {
  const lastRecord = await Karyawan.findOne().sort({ karyawanId: -1 });
  let nextIdNumber = 1;

  if (lastRecord && lastRecord.karyawanId) {
    const lastIdNumber = parseInt(lastRecord.karyawanId.slice(-4), 10);
    nextIdNumber = lastIdNumber + 1;
  }

  const nextId = `KAR${String(nextIdNumber).padStart(4, "0")}`;
  return nextId;
}

// Get All Karyawan
router.get("/", async (req, res) => {
  try {
    const karyawanRecords = await Karyawan.find();
    res.json(karyawanRecords);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Karyawan by ID
router.get("/:karyawanId", async (req, res) => {
  try {
    const karyawanRecord = await Karyawan.findOne({
      karyawanId: req.params.karyawanId,
    });
    if (!karyawanRecord)
      return res.status(404).json({ message: "Karyawan record not found" });
    res.json(karyawanRecord);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create Karyawan
router.post(
  "/",
  upload.fields([
    { name: "ktp", maxCount: 1 },
    { name: "kartu_keluarga", maxCount: 1 },
    { name: "pass_foto", maxCount: 1 },
    { name: "bpjs", maxCount: 1 },
    { name: "ijazah", maxCount: 1 },
    { name: "offering_letter", maxCount: 1 },
    { name: "kontrak_kerja", maxCount: 1 },
    { name: "sp", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const karyawanId = await generateKaryawanId();
      const files = req.files;
      const fileUrls = {};

      const nama_karyawan = req.body.nama_karyawan.replace(/\s+/g, "-");

      for (const fieldName in files) {
        const file = files[fieldName][0];
        const timestamp = moment().format("YYYYMMDD-HHmmss");
        const sanitizedFilename = file.originalname.replace(/\s+/g, "-");
        const blob = bucket.file(
          `Karyawan/${karyawanId}-${nama_karyawan}/${timestamp}-${sanitizedFilename}`
        );
        const blobStream = blob.createWriteStream();

        blobStream.on("error", (err) => {
          console.error(err);
          res.status(500).json({ message: err.message });
        });

        blobStream.on("finish", async () => {
          fileUrls[
            fieldName
          ] = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

          // Jika semua file sudah selesai diunggah, simpan data ke database
          if (Object.keys(fileUrls).length === Object.keys(files).length) {
            const newKaryawan = new Karyawan({
              karyawanId,
              ...req.body,
              ...fileUrls,
            });

            await newKaryawan.save();
            res.status(201).json(newKaryawan);
          }
        });

        blobStream.end(file.buffer);
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// Update Karyawan by ID
router.put(
  "/:karyawanId",
  upload.fields([
    { name: "ktp", maxCount: 1 },
    { name: "kartu_keluarga", maxCount: 1 },
    { name: "pass_foto", maxCount: 1 },
    { name: "bpjs", maxCount: 1 },
    { name: "ijazah", maxCount: 1 },
    { name: "offering_letter", maxCount: 1 },
    { name: "kontrak_kerja", maxCount: 1 },
    { name: "sp", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const files = req.files;
      const fileUrls = {};

      const nama_karyawan = req.body.nama_karyawan.replace(/\s+/g, "-");

      for (const fieldName in files) {
        const file = files[fieldName][0];
        const timestamp = moment().format("YYYYMMDD-HHmmss");
        const sanitizedFilename = file.originalname.replace(/\s+/g, "-");
        const blob = bucket.file(
          `Karyawan/${req.params.karyawanId}-${nama_karyawan}/${timestamp}-${sanitizedFilename}`
        );
        const blobStream = blob.createWriteStream();

        blobStream.on("error", (err) => {
          console.error(err);
          res.status(500).json({ message: err.message });
        });

        blobStream.on("finish", async () => {
          fileUrls[
            fieldName
          ] = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

          // Jika semua file sudah selesai diunggah, perbarui data di database
          if (Object.keys(fileUrls).length === Object.keys(files).length) {
            const updatedKaryawan = await Karyawan.findOneAndUpdate(
              { karyawanId: req.params.karyawanId },
              {
                ...req.body,
                ...fileUrls,
              },
              { new: true, runValidators: true }
            );

            if (!updatedKaryawan) {
              return res
                .status(404)
                .json({ message: "Karyawan record not found" });
            }

            res.status(200).json(updatedKaryawan);
          }
        });

        blobStream.end(file.buffer);
      }

      // Jika tidak ada file yang diunggah, perbarui data selain file
      if (Object.keys(files).length === 0) {
        const updatedKaryawan = await Karyawan.findOneAndUpdate(
          { karyawanId: req.params.karyawanId },
          req.body,
          { new: true, runValidators: true }
        );

        if (!updatedKaryawan) {
          return res.status(404).json({ message: "Karyawan record not found" });
        }

        res.status(200).json(updatedKaryawan);
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// Delete Karyawan by ID
router.delete("/:karyawanId", async (req, res) => {
  try {
    const karyawanRecord = await Karyawan.findOneAndDelete({
      karyawanId: req.params.karyawanId,
    });

    if (!karyawanRecord) {
      return res.status(404).json({ message: "Karyawan record not found" });
    }

    const filePath = `Karyawan/${
      karyawanRecord.karyawanId
    }-${karyawanRecord.nama_karyawan.replace(/\s+/g, "-")}`;
    const [files] = await bucket.getFiles({ prefix: filePath });

    files.forEach(async (file) => {
      await file.delete();
    });

    res.status(200).json({ message: "Karyawan record deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
