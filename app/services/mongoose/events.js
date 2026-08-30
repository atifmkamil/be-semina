const Events = require("../../api/v1/events/model");
const { BadRequestError, NotFoundError } = require("../../errors");
const { checkingImage } = require("./images");
const { checkingCategories } = require("./categories");
const { checkingTalents } = require("./talents");

const createEvents = async (req) => {
  const {
    title,
    date,
    about,
    tagline,
    keyPoint,
    venueName,
    statusEvent,
    tickets,
    image,
    category,
    talent,
  } = req.body;

  await checkingImage(image);
  await checkingCategories(category);
  await checkingTalents(talent);

  const check = await Events.findOne({ title });

  if (check) throw new BadRequestError("Judul Acara Sudah Terdaftar");

  const result = await Events.create({
    title,
    date,
    about,
    tagline,
    keyPoint,
    venueName,
    statusEvent,
    tickets,
    image,
    category,
    talent,
  });

  return result;
};

const getAllEvents = async (req) => {
  const { keyword, category, talent, status } = req.query;

  let condition = {};

  if (keyword) {
    condition = { ...condition, keyword: { $regex: keyword, $options: "i" } };
  }

  if (category) {
    condition = { ...condition, category: category };
  }

  if (talent) {
    condition = { ...condition, talent: talent };
  }

  if (status) {
    condition = { ...condition, status: status };
  }

  const result = await Events.find(condition)
    .populate({
      path: "image",
      select: "_id name",
    })
    .populate({ path: "category", select: "_id name" })
    .populate({
      path: "talent",
      select: "_id name role image",
      populate: { path: "image", select: "_id name" },
    });

  return result;
};

const getOneEvents = async (req) => {
  const { id } = req.params;

  const result = await Events.findOne({ _id: id })
    .populate({
      path: "image",
      select: "_id name",
    })
    .populate({ path: "category", select: "_id name" })
    .populate({
      path: "talent",
      select: "_id name role image",
      populate: { path: "image", select: "_id name" },
    });

  if (!result) throw new NotFoundError(`Tidak Ada Event dengan id: ${id}`);

  return result;
};

const updateEvents = async (req) => {
  const { id } = req.params;
  const {
    title,
    date,
    about,
    tagline,
    keyPoint,
    venueName,
    statusEvent,
    tickets,
    image,
    category,
    talent,
  } = req.body;

  await checkingImage(image);
  await checkingCategories(category);
  await checkingTalents(talent);

  const checkEvents = await Events.findById(id);

  if (!checkEvents)
    throw new NotFoundError(`Tidak ada Event dengan id :  ${id}`);

  const check = await Events.findOne({ title, _id: { $ne: id } });

  if (check) throw new BadRequestError("Judul Acara Sudah Terdaftar");

  const result = await Events.findByIdAndUpdate(
    id,
    {
      title,
      date,
      about,
      tagline,
      keyPoint,
      venueName,
      statusEvent,
      tickets,
      image,
      category,
      talent,
    },
    { new: true, runValidators: true },
  );

  return result;
};

const deleteEvents = async (req) => {
  const { id } = req.params;

  const result = await Events.findOneAndDelete({ _id: id });

  if (!result) throw new NotFoundError(`Tidak Ada Event dengan id: ${id}`);

  return result;
};

const changeStatusEvents = async (req) => {
  const { id } = req.params;
  const { status } = req.body;

  const checkEvents = await Events.findById(id);

  if (!checkEvents)
    throw new NotFoundError(`Tidak ada Event dengan id :  ${id}`);

  if (!(status === "Draft" ? true : status === "Published" ? true : false)) {
    throw new BadRequestError("Status yand dimasukkan Salah");
  }

  const result = await Events.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true },
  );

  return result;
};

module.exports = {
  createEvents,
  getAllEvents,
  getOneEvents,
  updateEvents,
  deleteEvents,
  changeStatusEvents,
};
