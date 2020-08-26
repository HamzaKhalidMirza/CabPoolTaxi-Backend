const Report = require("./../models/reportModel");

module.exports = function (io) {
  io.on("connection", (socket) => {

    socket.on("reportAdmin", async (data) => {
      const userEvent =
        data.reportedBy === "driver"
          ? data.driver + "-adminReported"
          : data.client + "-adminReported";
      const adminEvent = "newReportSubmitted";

      const report = await Report.create(data);
      if (report) {
        io.emit(userEvent, report);
        io.emit(adminEvent, report);
      } else {
        io.emit(userEvent, {
          data: "None",
        });
      }
    });
  });
};
