 require("dotenv").config();

const express = require("express");
const cors = require("cors");
const db = require("./App/Config/db.poolingConnection");
const logger = require("./App/Config/logger.config");
const allRoutes = require("./App/Routes/allRoutes");
require("./App/CronJobs/NotificationCron")

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", allRoutes);

db.getConnection()
  .then((connection) => {
    logger.info("MySQL Connected Successfully");
    connection.release();
  })
  .catch((err) => {
    logger.error(`Database Connection Failed : ${err.message}`);
  });

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`Server Running On Port ${PORT}`);
});