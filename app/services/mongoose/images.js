const Images = require("../../api/v1/images/model.js");
const { NotFoundError } = require("../../errors/index.js");

const createImages = async (req) => {
  const result = await Images.create({
    name: req.file
      ? `uploads/${req.file.filename}`
      : "uploads/avatar/default.jpeg",
  });

  return result;
};

const checkingImage = async (id) => {
  const result = await Images.findOne({ _id: id });

  if (!result) throw new NotFoundError(`Tidak ada Gambar dengan id: ${id}`);

  return result;
};

module.exports = { createImages, checkingImage };
