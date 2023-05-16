const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
const userRouter = require("./src/routes/user.routes");
const authRouter = require("./src/routes/auth.routes");

const SYSINFO = {
  studentName: "Matthé van den Berg",
  studentNumber: "2201635",
  description: "An API for storing and retrieving shared meals.",
};

app.use("*", (req, res, next) => {
  let time = new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");
  console.log(`[${time}] ${req.method} ${req.baseUrl}`);
  console.log(`Body: ${JSON.stringify(req.body)}`);
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
app.use(authRouter);

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
  console.log(`Share a Meal server listening on port ${port}`);
});

module.exports = app;
