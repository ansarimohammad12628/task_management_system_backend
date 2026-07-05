const express = require("express");
const upload = require ("../Utils/UploadFile")
const router = express.Router();

const AuthenticationRoutes = require("../Module/Authentication/V1/AuthenticationRoutes");
const EmployeeRoutes =require ("../Module/Employees/V1/EmployeeRoutes")
const TaskRoutes =require ("../Module/Task/V1/TaskRoutes")
const DashboardRoutes = require("../Module/Dashboard/V1/DashboardRoutes");
const ReportRoutes = require("../Module/Reports/V1/ReportRoutes");
const NotificationRoutes = require("../Module/Notifiaction/V1/NotificationRoutes");

router.use("/V1/authentication", AuthenticationRoutes);
router.use("/V1/employee", EmployeeRoutes);
router.use("/V1/task",TaskRoutes);
router.use("/V1/dashboard", DashboardRoutes);

router.use("/V1/report", ReportRoutes);

router.use(
  "/V1/notification",
  NotificationRoutes
);

module.exports = router; 