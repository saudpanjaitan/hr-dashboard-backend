const Hiring = require("../models/Hiring");

exports.getAllHiring = async (req, res) => {
  try {
    const hirings = await Hiring.find();
    res.status(200).json(hirings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createHiring = async (req, res) => {
  const hiring = new Hiring(req.body);
  try {
    const savedHiring = await hiring.save();
    res.status(201).json(savedHiring);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getHiringById = async (req, res) => {
  try {
    const hiring = await Hiring.findById(req.params.id);
    if (!hiring) return res.status(404).json({ message: "Hiring not found" });
    res.status(200).json(hiring);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateHiring = async (req, res) => {
  try {
    const updatedHiring = await Hiring.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedHiring)
      return res.status(404).json({ message: "Hiring not found" });
    res.status(200).json(updatedHiring);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteHiring = async (req, res) => {
  try {
    const deletedHiring = await Hiring.findByIdAndDelete(req.params.id);
    if (!deletedHiring)
      return res.status(404).json({ message: "Hiring not found" });
    res.status(200).json({ message: "Hiring deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
