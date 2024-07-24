const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const essSchema = new Schema({
  essId: { type: String, required: true, unique: true },
  nama_dokumen: { type: String, required: true },
  lampiran: { type: String, required: true }, // File path
  create_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ESS", essSchema);
