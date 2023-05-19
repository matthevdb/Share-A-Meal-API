const express = require("express");
const router = express.Router();
const mealController = require("../controllers/meal.controller");
const authController = require("../controllers/auth.controller");

// UC-301 Toevoegen van maaltijden
router.post(
  "/api/meal",
  authController.validateToken,
  mealController.validateMeal,
  mealController.addMeal
);

// UC-302 Wijzigen van maaltijdgegevens
router.put(
  "/api/meal/:id",
  authController.validateToken,
  mealController.validateMeal,
  mealController.updateMeal
);

// UC-303 Opvragen van alle maaltijden
router.get("/api/meal", mealController.getAllMeals);

// UC-304 Opvragen van maaltijd bij ID
router.get("/api/meal/:id", mealController.getMealByID);

// UC-305 Verwijderen van maaltijd
router.delete(
  "/api/meal/:id",
  authController.validateToken,
  mealController.deleteMeal
);

// UC-401 Aanmelden voor maaltijd
router.post(
  "/api/meal/:mealId/participate",
  authController.validateToken,
  mealController.participate
);

// UC-402 Afmelden voor maaltijd

module.exports = router;
