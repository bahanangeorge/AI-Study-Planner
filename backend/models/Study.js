const mongoose = require("mongoose");

const StudySchema = new mongoose.Schema({
  subject: String,
  deadline: String,
});

module.exports = mongoose.model("Study", StudySchema);