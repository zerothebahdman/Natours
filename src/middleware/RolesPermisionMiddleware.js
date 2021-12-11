// ----Implementing Authorization: User roles and permission----

const AppError = require('../utils/AppErrorClass');

// create an arbitrary function that returns the authorization middleware function
const restrictTo =
  (...roles) =>
  // roles in this instance is a array coming from the tour route ['admin', 'lead-guide']
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(`You dont have permission to perform this action`, 403)
      );
    }

    next();
  };

module.exports = restrictTo;
