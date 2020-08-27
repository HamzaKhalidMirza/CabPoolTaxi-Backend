const mongoose = require("mongoose");
const dotenv = require("dotenv");
const socketIO = require("socket.io");

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: "./config.env" });
const app = require("./app");

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB connection successful!"));

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const adminRouter = require("./routes/adminRoutes");
const clientRouter = require("./routes/clientRoutes");
const driverRouter = require("./routes/driverRoutes");
const vehicleRouter = require("./routes/vehicleRoutes");
const tripRouter = require("./routes/tripRoutes");
const requestRouter = require("./routes/requestRoutes");
const bookingRouter = require("./routes/bookingRoutes");
const paymentRouter = require('./routes/paymentRoutes');
// const reviewRouter = require('./routes/reviewRoutes');

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
const io = socketIO(server);
server.io = io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});
app.use((req, res, next) => {
  req.io = io;
  next();
});

/*
  Sockets
*/
require("./sockets/clientChatSocket")(io);
require("./sockets/driverChatSocket")(io);
require("./sockets/clientTripSocket")(io);
require("./sockets/driverTripSocket")(io);
require("./sockets/reportSocket")(io);

/*
  Routes
*/
app.use("/api/v1/admins", adminRouter);
app.use("/api/v1/clients", clientRouter);
app.use("/api/v1/drivers", driverRouter);
app.use("/api/v1/vehicles", vehicleRouter);
app.use("/api/v1/trips", tripRouter);
app.use("/api/v1/requests", requestRouter);
app.use("/api/v1/bookings", bookingRouter);
app.use('/api/v1/payments', paymentRouter);
// app.use('/api/v1/reviews', reviewRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

/*
  Global Error Handler/Controller
*/
app.use(globalErrorHandler);

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on("SIGTERM", () => {
  console.log("👋 SIGTERM RECEIVED. Shutting down gracefully");
  server.close(() => {
    console.log("💥 Process terminated!");
  });
});
