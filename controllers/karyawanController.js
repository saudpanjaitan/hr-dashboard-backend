const Karyawan = require("../models/Karyawan");

exports.getAllKaryawan = async (req, res) => {
  try {
    const karyawans = await Karyawan.find();
    res.status(200).json(karyawans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createKaryawan = async (req, res) => {
  const karyawan = new Karyawan(req.body);
  try {
    const savedKaryawan = await karyawan.save();
    res.status(201).json(savedKaryawan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getKaryawanById = async (req, res) => {
  try {
    const karyawan = await Karyawan.findById(req.params.id);
    if (!karyawan)
      return res.status(404).json({ message: "Karyawan not found" });
    res.status(200).json(karyawan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateKaryawan = async (req, res) => {
  try {
    const updatedKaryawan = await Karyawan.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedKaryawan)
      return res.status(404).json({ message: "Karyawan not found" });
    res.status(200).json(updatedKaryawan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteKaryawan = async (req, res) => {
  try {
    const deletedKaryawan = await Karyawan.findByIdAndDelete(req.params.id);
    if (!deletedKaryawan)
      return res.status(404).json({ message: "Karyawan not found" });
    res.status(200).json({ message: "Karyawan deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
