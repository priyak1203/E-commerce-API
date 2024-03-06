const CustomError = require('../errors');
const { isTokenValid } = require('../utils/jwt');

const authenticateUser = (req, res, next) => {
  const { token } = req.signedCookies;

  if (!token)
    throw new CustomError.UnauthenticatedError('Authentication invalid');

  try {
    const { name, userId, role } = isTokenValid({ token });
    req.user = {
      name,
      userId,
      role,
    };

    next();
  } catch (error) {
    throw new CustomError.UnauthenticatedError('Authentication invalid');
  }
};

// role is hardcoded
// const authorizePermissions = (req, res, next) => {
//   if (req.user.role !== 'admin') {
//     throw new CustomError.UnauthorizedError(
//       'Unauthorized to access this route'
//     );
//   }

//   next();
// };

// general for multiple roles
const authorizePermissions = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new CustomError.UnauthorizedError(
        'Not Authorized to access this route'
      );
    }
    next();
  };
};

module.exports = {
  authenticateUser,
  authorizePermissions,
};
