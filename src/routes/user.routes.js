const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const authController = require("../controllers/auth.controller");

// UC-201 Registreren als nieuwe user
router.post("/api/user", userController.validateUser, userController.addUser);

// UC-202 Opvragen van overzicht van users
router.get(
  "/api/user",
  authController.validateToken,
  userController.getAllUsers
);

// UC-203 Opvragen van gebruikersprofiel
router.get(
  "/api/user/profile",
  authController.validateToken,
  userController.getUserProfile
);

// UC-204 Opvragen van usergegevens bij ID
router.get(
  "/api/user/:id",
  authController.validateToken,
  userController.getUserByID
);

// UC-205 Wijzigen van usergegevens
router.put(
  "/api/user/:id",
  authController.validateToken,
  userController.validateUser,
  userController.updateUserData
);

// UC-206 Verwijderen van user
router.delete(
  "/api/user/:id",
  authController.validateToken,
  userController.deleteUser
);

module.exports = router;
