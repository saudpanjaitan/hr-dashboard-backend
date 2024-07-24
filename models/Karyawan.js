const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const karyawanSchema = new Schema({
  karyawanId: { type: String, required: true, unique: true },
  nama_karyawan: { type: String, required: true },
  alamat: { type: String, required: true },
  no_telfon: { type: Number, required: true },
  gender: { type: String, required: true },
  tanggal_join: { type: Date, required: true },
  habis_kontrak: { type: Date, required: true },
  unit: { type: String, required: true },
  ktp: { type: String, required: true },
  kartu_keluarga: { type: String, required: true },
  pass_foto: { type: String, required: true },
  bpjs: { type: String, required: true },
  ijazah: { type: String, required: true },
  offering_letter: { type: String, required: true },
  kontrak_kerja: { type: String, required: true },
  sp: { type: String, required: true },
  create_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Karyawan", karyawanSchema);
