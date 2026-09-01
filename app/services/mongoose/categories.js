const Categories = require("../../api/v1/categories/model.js");

const { NotFoundError, BadRequestError } = require("../../errors");

const getAllCategories = async (req) => {
  const result = await Categories.find({ organizer: req.user.organizer });
  return result;
};

const createCategories = async (req) => {
  const { name } = req.body;

  const check = await Categories.findOne({
    name,
    organizer: req.user.organizer,
  });

  if (check) throw new BadRequestError("kategori nama duplikat");

  const result = await Categories.create({
    name,
    organizer: req.user.organizer,
  });

  return result;
};

const getOneCategories = async (req) => {
  const { id } = req.params;
  const result = await Categories.findOne({
    _id: id,
    organizer: req.user.organizer,
  });

  if (!result) throw new NotFoundError(`Tidak ada Kategori dengan id :  ${id}`);

  return result;
};

const updateCategories = async (req) => {
  const { id } = req.params;
  const { name } = req.body;

  const checkCategory = await checkingCategories(req);

  const check = await Categories.findOne({
    name,
    organizer: req.user.organizer,
    _id: { $ne: id },
  });

  if (check) throw new BadRequestError("kategori nama duplikat");

  const result = await Categories.findOneAndUpdate(
    {
      _id: id,
      organizer: req.user.organizer,
    },
    { name },
    { new: true, runValidator: true },
  );

  return result;
};
const deleteCategories = async (req) => {
  const { id } = req.params;
  const result = await Categories.findOneAndRemove({
    _id: id,
    organizer: req.user.organizer,
  });

  if (!result) throw new NotFoundError(`Tidak ada Kategori dengan id :  ${id}`);

  return result;
};

const checkingCategories = async (req) => {
  const { id } = req.params;
  const result = await Categories.findOne({
    _id: id,
    organizer: req.user.organizer,
  });

  if (!result) throw new NotFoundError(`Tidak ada Kategori dengan id: ${id}`);

  return result;
};

module.exports = {
  getAllCategories,
  createCategories,
  getOneCategories,
  updateCategories,
  deleteCategories,
  checkingCategories,
};
