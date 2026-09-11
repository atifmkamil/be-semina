const UserRefreshToken = require("../../../app/api/v1/userRefreshToken/model");
const {
  isTokenValidRefreshToken,
  createJWT,
  createTokenUser,
} = require("../../utils");
const User = require("../../api/v1/users/model");
const { BadRequestError } = require("../../errors");

const createUserRefreshToken = async (payload) => {
  const result = await UserRefreshToken.create(payload);

  return result;
};

const getUserRefreshToken = async (req) => {
  const { refreshToken } = req.params;
  const result = await UserRefreshToken.findOne({ refreshToken });

  const payload = isTokenValidRefreshToken({ token: result.refreshToken });

  const userCheck = await User.findOne({ email: payload.email });

  const token = createJWT({ payload: createTokenUser(userCheck) });

  return token;
};

module.exports = { createUserRefreshToken, getUserRefreshToken };
