const { StatusCodes } = require('http-status-codes');
const User = require('../models/User');
const CustomError = require('../errors');
const {
  createTokenUser,
  attachCookiesToResponse,
  checkPermissions,
} = require('../utils');

const getAllUsers = async (req, res) => {
  const users = await User.find({ role: 'user' }).select('-password');
  res.status(StatusCodes.OK).json({ users });
};

const getSingleUser = async (req, res) => {
  const { id } = req.params;

  const user = await User.findOne({ _id: id }).select('-password');
  if (!user) {
    throw new CustomError.NotFoundError(`No user with id: ${id}`);
  }

  checkPermissions({ requestUser: req.user, resourceUserId: user._id });

  res.status(StatusCodes.OK).json({ user });
};

const showCurrentUser = (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user });
};

// update user with findOneAndUpdate
// const updateUser = async (req, res) => {
//   const { name, email } = req.body;

//   if (!name || !email) {
//     throw new CustomError.BadRequestError('Please provide all values');
//   }

//   const user = await User.findOneAndUpdate(
//     { _id: req.user.userId },
//     { name, email },
//     { new: true, runValidators: true }
//   );

//   const tokenUser = createTokenUser(user);
//   attachCookiesToResponse({ res, tokenUser });

//   res.status(StatusCodes.OK).json({ user: tokenUser });
// };

// update user with user.save()
const updateUser = async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    throw new CustomError.BadRequestError('Please provide all values');
  }

  const user = await User.findOne({ _id: req.user.userId });
  user.email = email;
  user.name = name;
  await user.save();

  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, tokenUser });

  res.status(StatusCodes.OK).json({ user: tokenUser });
};

const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new CustomError.BadRequestError('Please provide both values');
  }

  const user = await User.findOne({ _id: req.user.userId });

  const isPasswordCorrect = await user.comparePassword(oldPassword);
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError('Invalid Credentials');
  }

  user.password = newPassword;

  await user.save();

  res.status(StatusCodes.OK).json({ msg: 'Success! Password updated.' });
};

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};
