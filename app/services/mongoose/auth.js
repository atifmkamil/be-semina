const Users = require("../../api/v1/users/model");
const { BadRequestError, UnauthorizedError } = require("../../errors");
const { createTokenUser, createJWT, createRefreshJWT } = require("../../utils");
const {
  createUserRefreshToken,
} = require("../../services/mongoose/userRefreshToken");

const signin = async (req) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError("Please provide email and password");
  }

  const result = await Users.findOne({ email: email });

  if (!result) {
    throw new UnauthorizedError("Invalid Credentials");
  }

  const isPasswordCorrect = await result.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new UnauthorizedError("Invalid Credentials");
  }

  const token = createJWT({ payload: createTokenUser(result) });
  const refreshToken = createRefreshJWT({ payload: createTokenUser(result) });

  await createUserRefreshToken({
    refreshToken,
    user: result._id,
  });

  // return token;

  // start of post-script postman
  const { role } = result;

  return {
    token,
    refreshToken,
    role,
    email: result.email,
  };
  // end of post-script postman
};

module.exports = { signin };
