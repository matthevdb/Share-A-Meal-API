const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
const userRouter = require("./src/routes/user.routes");

const SYSINFO = {
  studentName: "Matthé van den Berg",
  studentNumber: "2201635",
  description: "An API for storing and retrieving shared meals.",
};

app.use("*", (req, res, next) => {
  console.log(`${req.method} ${req.baseUrl} has been called`);
  next();
});

app.get("/api/info", (req, res) => {
  res.status(200).json({
    status: 200,
    message: "Server info-endpoint.",
    data: SYSINFO,
  });
});

app.use(userRouter);

app.use("*", (req, res) => {
  res.status(404).json({
    status: 404,
    message: "Endpoint not found.",
    data: {},
  });
});

app.use((err, req, res, next) => {
  res.status(err.status).json(err);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

module.exports = app;
