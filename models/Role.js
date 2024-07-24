const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const roleSchema = new Schema({
  roleId: { type: String, required: true, unique: true },
  roleName: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  accessPages: { type: [String], required: true },
  actions: { type: [String], required: true },
});

module.exports = mongoose.model("Role", roleSchema);
