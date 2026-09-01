const Talents = require("../../api/v1/talents/model");

const { NotFoundError, BadRequestError } = require("../../errors");
const { checkingImage } = require("./images");

const getAllTalents = async (req) => {
  const { keyword } = req.query;

  let condition = { organizer: req.user.organizer };

  if (keyword) {
    condition = { ...condition, name: { $regex: keyword, $options: "i" } };
  }

  const result = await Talents.find(condition)
    .populate({
      path: "image",
      select: "_id name",
    })
    .select("_id name role image");

  return result;
};

const createTalents = async (req) => {
  const { name, role, image } = req.body;

  await checkingImage(image);

  const check = await Talents.findOne({ name, organizer: req.user.organizer });

  if (check) throw new BadRequestError("Pembicara Nama Duplikat");

  const result = await Talents.create({
    name,
    image,
    role,
    organizer: req.user.organizer,
  });

  return result;
};

const getOneTalens = async (req) => {
  const { id } = req.params;

  const result = await Talents.findOne({
    _id: id,
    organizer: req.user.organizer,
  })
    .populate({
      path: "image",
      select: "_id name",
    })
    .select("_id name role image");

  if (!result) throw new NotFoundError(`Tidak ada Pembicara dengan id: ${id}`);

  return result;
};

const updateTalents = async (req) => {
  const { id } = req.params;
  const { name, role, image } = req.body;

  const checkTalents = await checkingTalents(id);

  await checkingImage(image);

  const check = await Talents.findOne({
    name,
    organizer: req.user.organizer,
    _id: { $ne: id },
  });

  if (check) throw new BadRequestError("Pembicara Nama Duplikat");

  const result = await Talents.findOneAndUpdate(
    {
      _id: id,
      organizer: req.user.organizer,
    },
    { name, role, image, organizer: req.user.organizer },
    { new: true, runValidators: true },
  );

  return result;
};

const deleteTalents = async (req) => {
  const { id } = req.params;

  const check = await Talents.findOne({
    _id: id,
    organizer: req.user.organizer,
  });

  if (!check) throw new NotFoundError(`Tidak ada pembicara dengan id: ${id}`);

  const result = await Talents.findByIdAndDelete(id);

  return result;
};

const checkingTalents = async (id) => {
  const result = await Talents.findOne({
    _id: id,
  });

  if (!result)
    throw new NotFoundError(`Tidak ada pembicara dengan id :  ${id}`);

  return result;
};

module.exports = {
  getAllTalents,
  createTalents,
  getOneTalens,
  updateTalents,
  deleteTalents,
  checkingTalents,
};
