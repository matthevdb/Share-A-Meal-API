const router = require("express").Router();
const controller = require("../controllers/auth.controller");

router.post("/api/login", controller.validateLoginBody, controller.login);

module.exports = router;
