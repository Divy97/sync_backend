const mongoose = require("mongoose");

const DocumentSchema = new mongoose.Schema({
  _id: String,
  data: Object,
  owner: String,
  isEditable: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Document", DocumentSchema);
