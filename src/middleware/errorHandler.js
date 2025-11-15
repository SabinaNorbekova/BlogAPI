// middleware/errorHandler.js
export const errorHandler = (err, req, res, next) => {
  console.error(err);

  let statusCode = 500;
  let message = 'An unexpected error occurred. Please try again later.';

  if (err.name === 'PrismaClientKnownRequestError') {
    if (err.code === 'P2002') {
      statusCode = 409;
      message = `Duplicate field value: ${err.meta?.target || 'unknown field'}.`;
    } else if (err.code === 'P2025') {
      statusCode = 404;
      message = `Resource not found: ${err.meta?.cause || 'unknown resource'}.`;
    }
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token.';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired.';
  }

  res.status(statusCode).json({ message });
};
