module.exports = {

  successResponse(message, data = []) {
    return {
      success: true,
      response_code: 200,
      message,
      data,
    };
  },

  errorResponse(message, response_code = 400) {
    return {
      success: false,
      response_code,
      message,
    };
  },

};