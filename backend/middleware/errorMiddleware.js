const errorHandler = (err, req, res, next) => {

  console.error(`[Error] ${err.name}: ${err.message}`);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Server Error";

  // 1️⃣ Mongoose Invalid ObjectId
  if (err.name === "CastError") {
    statusCode = 404;
    message = `Resource not found with id of ${err.value}`;
  }

  // 2️⃣ Duplicate Key Error
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`;
  }

  // 3️⃣ Validation Error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack
  });

};

export default errorHandler;