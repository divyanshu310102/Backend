const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next))
    .catch((err) => next(err));
  };
};

export { asyncHandler };


//Another method for making wrapper

// const createAsyncHandler = (handler) => {
//   return async (req, res, next) => {
//     try {
//       await handler(req, res,next);
//     } catch (error) {
//       res.status(err.code || 500).json({
//         success:false,
//         message:err.message
//       })
//     }
//   };
// };