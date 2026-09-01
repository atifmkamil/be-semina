const Organizers = require("../../api/v1/organizers/model");
const Users = require("../../api/v1/users/model");
const { BadRequestError } = require("../../errors");

const createOrganizer = async (req) => {
  const { organizer, name, email, password, confirmPassword, role } = req.body;

  if (password !== confirmPassword)
    throw new BadRequestError("Password dan Confirm Password tidak cocok");

  const result = await Organizers.create({ organizer });

  const users = await Users.create({
    name,
    email,
    password,
    role,
    organizer: result._id,
  });

  delete users._doc.password;

  return users;
};

const createUser = async (req) => {
  const { name, password, role, confirmPassword, email } = req.body;

  console.log(req.user);

  if (password !== confirmPassword) {
    throw new BadRequestError("Password dan Confirm Password tidak cocok");
  }

  const result = await Users.create({
    name,
    email,
    organizer: req.user.organizer,
    password,
    role,
  });

  return result;
};

const getAllUsers = async (req) => {
  const result = await Users.find();

  return result;
};

module.exports = { createOrganizer, createUser, getAllUsers };
