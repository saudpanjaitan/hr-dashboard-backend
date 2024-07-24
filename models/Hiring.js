const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const hiringSchema = new Schema({
  hiringId: { type: String, required: true, unique: true },
  nama_kandidat: { type: String, required: true },
  posisi_yang_dilamar: { type: String, required: true },
  tanggal_interview: { type: Date, required: true },
  summary: { type: String, required: true },
  hasil_interview: { type: String, required: true },
  lampiran_cv: { type: String, required: true },
});

module.exports = mongoose.model("Hiring", hiringSchema);
