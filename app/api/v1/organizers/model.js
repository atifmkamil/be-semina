const mongoose = require("mongoose");

let organizerSchema = new mongoose.Schema(
  {
    organizer: {
      type: String,
      required: [true, "Penyelenggara harus diisi"],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Organizer", organizerSchema);
