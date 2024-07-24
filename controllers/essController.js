const ESS = require("../models/ESS");

exports.getAllESS = async (req, res) => {
  try {
    const esss = await ESS.find();
    res.status(200).json(esss);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createESS = async (req, res) => {
  const ess = new ESS(req.body);
  try {
    const savedESS = await ess.save();
    res.status(201).json(savedESS);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getESSById = async (req, res) => {
  try {
    const ess = await ESS.findById(req.params.id);
    if (!ess) return res.status(404).json({ message: "ESS not found" });
    res.status(200).json(ess);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateESS = async (req, res) => {
  try {
    const updatedESS = await ESS.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedESS) return res.status(404).json({ message: "ESS not found" });
    res.status(200).json(updatedESS);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteESS = async (req, res) => {
  try {
    const deletedESS = await ESS.findByIdAndDelete(req.params.id);
    if (!deletedESS) return res.status(404).json({ message: "ESS not found" });
    res.status(200).json({ message: "ESS deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
