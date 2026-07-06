const moment = require("moment");

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

  // YYYY-MM-DD HH:mm:ss
  commonFormateDate(dateData) {
    return moment(dateData).format("YYYY-MM-DD HH:mm:ss");
  },

  // YYYY-MM-DD
  commonFormateDateOnly(dateData) {
    return moment(dateData).format("YYYY-MM-DD");
  },

  // HH:mm:ss
  commonFormateTimeOnly(dateData) {
    return moment(dateData).format("HH:mm:ss");
  },

  // From Date (e.g. 2 days ago, 5 minutes ago)
  fromDate(dateData) {
    return moment(dateData).fromNow();
  },

};