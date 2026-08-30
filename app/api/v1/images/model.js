const mongoose = require("mongoose");

let imageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Image", imageSchema);
