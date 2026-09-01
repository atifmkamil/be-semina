const mongoose = require("mongoose");

let categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      minlength: [3, "Panjang nama kategori minimal 3 karakter"],
      maxLength: [20, "Panjang nama kategori maksimal 20 karakter"],
      required: [true, "Nama kategori harus diisi"],
    },
    organizer: {
      type: mongoose.Types.ObjectId,
      ref: "Organizer",
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Category", categorySchema);
