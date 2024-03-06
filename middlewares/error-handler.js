const { StatusCodes } = require('http-status-codes');

const errorHandler = (err, req, res, next) => {
  let customError = {
    // set default
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: err.message || 'Something went wrong, try again later',
  };

  // validation error
  if (err.name === 'ValidationError') {
    customError.statusCode = StatusCodes.BAD_REQUEST;
    customError.msg = Object.values(err.errors)
      .map((item) => item.message)
      .join(',');
  }

  // duplicate email error
  if (err.code && err.code === 11000) {
    customError.statusCode = StatusCodes.BAD_REQUEST;
    customError.msg = `Duplicate value entered for ${Object.keys(
      err.keyValue
    )} field, please choose another value`;
  }

  // cast error
  if (err.name === 'CastError') {
    customError.statusCode = StatusCodes.NOT_FOUND;
    customError.msg = `No item found with id: ${err.value}`;
  }

  return res.status(customError.statusCode).json({ msg: customError.msg });
};

module.exports = errorHandler;
