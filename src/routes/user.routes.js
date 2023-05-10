const express = require("express");
const router = express.Router();
const controller = require("../controllers/user.controller");

// UC-201 Registreren als nieuwe user
router.post("/api/user", controller.validateUser, controller.addUser);

// UC-202 Opvragen van overzicht van users
router.get("/api/user", controller.getAllUsers);

// UC-203 Opvragen van gebruikersprofiel
router.get("/api/user/profile", controller.getUserProfile);

// UC-204 Opvragen van usergegevens bij ID
router.get("/api/user/:id", controller.getUserByID);

// UC-205 Wijzigen van usergegevens
router.put("/api/user/:id", controller.validateUser, controller.updateUserData);

// UC-206 Verwijderen van user
router.delete("/api/user/:id", controller.deleteUser);

module.exports = router;
