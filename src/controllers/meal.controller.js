const assert = require("assert");
const pool = require("../../database/dbconnection");

let controller = {
  validateMeal: (req, res, next) => {
    let {
      name,
      description,
      isActive,
      isVega,
      isVegan,
      isToTakeHome,
      dateTime,
      maxAmountOfParticipants,
      price,
      imageUrl,
      allergenes,
    } = req.body;

    try {
      // Set default values for undefined properties. If not undefined, assert correct type
      isActive === undefined
        ? (req.body.isActive = true)
        : assert(typeof isActive === "boolean", "isActive must be a boolean");
      isVega === undefined
        ? (req.body.isVega = false)
        : assert(typeof isVega === "boolean", "isVega must be a boolean");
      isVegan === undefined
        ? (req.body.isVegan = false)
        : assert(typeof isVegan === "boolean", "isVegan must be a boolean");
      isToTakeHome === undefined
        ? (req.body.isToTakeHome = false)
        : assert(
            typeof isToTakeHome === "boolean",
            "isToTakeHome must be a boolean"
          );
      allergenes === undefined
        ? (req.body.allergenes = "")
        : assert(
            typeof allergenes === "object",
            "allergenes must be an object"
          );

      req.body.allergenes = allergenes ? allergenes.join(",") : "";

      // Assert type of required fields
      assert(typeof name === "string", "name must be a string");
      assert(typeof description === "string", "description must be a string");
      assert(typeof dateTime === "string", "dateTime must be a string");
      assert(
        typeof maxAmountOfParticipants === "number",
        "maxAmountOfParticipants must be a number"
      );
      assert(typeof price === "number", "price must be a number");
      assert(typeof imageUrl === "string", "imageUrl must be a string");

      next();
    } catch (err) {
      const error = {
        status: 400,
        message: err.message,
        data: {},
      };

      next(error);
    }
  },
  addMeal: (req, res, next) => {
    let cookId = req.userId;

    pool.query(
      "INSERT INTO meal (cookId, name, description, isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, allergenes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        cookId,
        req.body.name,
        req.body.description,
        req.body.isActive,
        req.body.isVega,
        req.body.isVegan,
        req.body.isToTakeHome,
        req.body.dateTime,
        req.body.maxAmountOfParticipants,
        req.body.price,
        req.body.imageUrl,
        req.body.allergenes,
      ],
      (err, result) => {
        if (err) {
          return next({
            status: 500,
            message: "Internal server error",
            data: {},
          });
        }

        res.status(201).json({
          status: 201,
          message: `Added meal with id ${result.insertId}`,
          data: { id: result.insertId, ...req.body },
        });
      }
    );
  },
  getAllMeals: (req, res, next) => {
    pool.query(
      "SELECT *, meal.id AS mealId, user.id AS cookId from meal JOIN user ON meal.cookId = user.id;",
      (error, result) => {
        if (result.length == 0) {
          next({
            status: 404,
            message: "No meals found.",
            data: {},
          });
        } else {
          res.status(200).json({
            status: 200,
            message: "Meals found.",
            data: result.map((row) => {
              return {
                id: row.mealId,
                name: row.name,
                description: row.description,
                isActive: row.isActive,
                isVega: row.isVega,
                isVegan: row.isVegan,
                isToTakeHome: row.isToTakeHome,
                dateTime: row.dateTime,
                maxAmountOfParticipants: row.maxAmountOfParticipants,
                price: row.price,
                imageUrl: row.imageUrl,
                allergenes: row.allergenes
                  ? Array.from(row.allergenes.split(","))
                  : [],
                cook: {
                  id: row.cookId,
                  firstName: row.firstName,
                  lastName: row.lastName,
                  isActive: row.isActive,
                  emailAdress: row.emailAdress,
                  password: row.password,
                  phoneNumber: row.phoneNumber,
                  roles: row.roles,
                  street: row.street,
                  city: row.city,
                },
              };
            }),
          });
        }
      }
    );
  },
  getMealByID: (req, res, next) => {
    let id = req.params.id;

    pool.query(
      "SELECT *, meal.id AS mealId, user.id AS cookId from meal JOIN user ON meal.cookId = user.id WHERE meal.id = ?;",
      id,
      (error, result) => {
        if (result.length == 0) {
          const error = {
            status: 404,
            message: `Meal with id ${id} not found.`,
            data: {},
          };

          next(error);
        } else {
          res.status(200).json({
            status: 200,
            message: `Meal with id ${id} found.`,
            data: result.map((row) => {
              return {
                id: row.mealId,
                name: row.name,
                description: row.description,
                isActive: row.isActive,
                isVega: row.isVega,
                isVegan: row.isVegan,
                isToTakeHome: row.isToTakeHome,
                dateTime: row.dateTime,
                maxAmountOfParticipants: row.maxAmountOfParticipants,
                price: row.price,
                imageUrl: row.imageUrl,
                allergenes: row.allergenes
                  ? Array.from(row.allergenes.split(","))
                  : [],
                cook: {
                  id: row.cookId,
                  firstName: row.firstName,
                  lastName: row.lastName,
                  isActive: row.isActive,
                  emailAdress: row.emailAdress,
                  password: row.password,
                  phoneNumber: row.phoneNumber,
                  roles: row.roles,
                  street: row.street,
                  city: row.city,
                },
              };
            })[0],
          });
        }
      }
    );
  },
  updateMeal: (req, res, next) => {
    let id = parseInt(req.params.id);

    pool.query("SELECT cookId FROM meal WHERE id = ?", [id], (err, result) => {
      if (result.length == 0) {
        return next({
          status: 404,
          message: `Meal with id ${id} not found.`,
          data: {},
        });
      } else if (result[0].cookId !== req.userId) {
        return next({
          status: 403,
          message: "You do not own this data",
          data: {},
        });
      } else {
        pool.query(
          "UPDATE meal SET name = ?, description = ?, isActive = ?, isVega = ?, isVegan = ?, isToTakeHome = ?, dateTime = ?, maxAmountOfParticipants = ?, price = ?, imageUrl = ?, allergenes = ? WHERE id = ?",
          [
            req.body.name,
            req.body.description,
            req.body.isActive,
            req.body.isVega,
            req.body.isVegan,
            req.body.isToTakeHome,
            req.body.dateTime,
            req.body.maxAmountOfParticipants,
            req.body.price,
            req.body.imageUrl,
            req.body.allergenes,
            id,
          ],
          (err, result) => {
            if (err) {
              return next({
                status: 500,
                message: "Internal server error",
                data: {},
              });
            }

            res.status(200).json({
              status: 200,
              message: `Updated meal with id ${id}.`,
              data: { id: id, ...req.body },
            });
          }
        );
      }
    });
  },
  deleteMeal: (req, res, next) => {
    let id = parseInt(req.params.id);

    pool.query("SELECT cookId FROM meal WHERE id = ?", [id], (err, result) => {
      if (result.length == 0) {
        return next({
          status: 404,
          message: `Meal with id ${id} not found.`,
          data: {},
        });
      } else if (result[0].cookId !== req.userId) {
        return next({
          status: 403,
          message: "You do not own this data",
          data: {},
        });
      } else {
        pool.query("DELETE FROM meal WHERE id = ?", id, (err, result) => {
          res.status(200).json({
            status: 200,
            message: `Deleted meal with id ${id}.`,
            data: {},
          });
        });
      }
    });
  },
  participate: (req, res, next) => {
    let mealId = parseInt(req.params.mealId);

    pool.query(
      "SELECT COUNT(*) AS count FROM meal WHERE id = ?",
      mealId,
      (err, result) => {
        if (result[0].count == 0) {
          return next({
            status: 404,
            message: `Meal with id ${mealId} not found.`,
            data: {},
          });
        }

        pool.query(
          "SELECT COUNT(*) AS count FROM meal_participants_user WHERE mealId = ?; SELECT maxAmountOfParticipants AS max FROM meal WHERE id = ?",
          [mealId, mealId],
          (err, result) => {
            if (err) {
              return next({
                status: 500,
                message: "Internal server error",
                data: {},
              });
            }

            let participants = result[0][0].count;
            let maxParticipants = result[1][0].max;

            if (participants == maxParticipants) {
              return next({
                status: 200,
                message: "Max amount of participants reached",
                data: {},
              });
            }

            pool.query(
              "INSERT INTO meal_participants_user (mealId, userId) VALUES (?, ?)",
              [mealId, req.userId],
              (err, result) => {
                if (err) {
                  if (err.code === "ER_DUP_ENTRY") {
                    return next({
                      status: 409,
                      message: "User already registered for this meal",
                      data: {},
                    });
                  } else if (err.code === "ER_NO_REFERENCED_ROW_2")
                    return next({
                      status: 404,
                      message: "Meal does not exist",
                      data: {},
                    });
                }

                res.status(200).json({
                  status: 200,
                  message: `User with id ${req.userId} registered for meal with id ${mealId}`,
                  data: {},
                });
              }
            );
          }
        );
      }
    );
  },
  removeParticipation: (req, res, next) => {
    let mealId = parseInt(req.params.mealId);

    pool.query(
      "SELECT COUNT(*) AS count FROM meal WHERE id = ?",
      mealId,
      (err, result) => {
        if (result[0].count == 0) {
          return next({
            status: 404,
            message: `Meal with id ${mealId} not found.`,
            data: {},
          });
        }

        pool.query(
          "DELETE FROM meal_participants_user WHERE mealId = ? AND userId = ?",
          [mealId, req.userId],
          (err, result) => {
            if (result.affectedRows == 0) {
              return next({
                status: 404,
                message: `User with id ${req.userId} does not have a participation for meal with id ${mealId}.`,
                data: {},
              });
            }

            res.status(200).json({
              status: 200,
              message: `User with id ${req.userId} unsubscribed from meal with id ${mealId}`,
              data: {},
            });
          }
        );
      }
    );
  },
  getParticipantsByMealId: (req, res, next) => {
    let mealId = parseInt(req.params.mealId);

    pool.query(
      "SELECT cookId FROM meal WHERE id = ?",
      mealId,
      (err, result) => {
        if (result.length == 0) {
          return next({
            status: 404,
            message: `Meal with id ${mealId} not found.`,
            data: {},
          });
        }

        if (result[0].cookId != req.userId) {
          return next({
            status: 403,
            message: "You do not own this data",
            data: {},
          });
        }

        pool.query(
          "SELECT user.* FROM user JOIN meal_participants_user ON user.id = meal_participants_user.userId WHERE meal_participants_user.mealId = ?",
          mealId,
          (err, result) => {
            if (result.length == 0) {
              return next({
                status: 404,
                message: `No participants found for meal with id ${mealId}`,
                data: {},
              });
            }

            res.status(200).json({
              status: 200,
              message: `Participants for meal with id ${mealId}`,
              result: result.map(({ password, ...userdata }) => userdata),
            });
          }
        );
      }
    );
  },
  getParticipantDetails: (req, res, next) => {
    let mealId = parseInt(req.params.mealId);
    let participantId = parseInt(req.params.participantId);

    pool.query(
      "SELECT cookId FROM meal WHERE id = ?",
      mealId,
      (err, result) => {
        if (result.length == 0) {
          return next({
            status: 404,
            message: `Meal with id ${mealId} not found.`,
            data: {},
          });
        }

        if (result[0].cookId != req.userId) {
          return next({
            status: 403,
            message: "You do not own this data",
            data: {},
          });
        }

        pool.query(
          "SELECT user.* FROM user JOIN meal_participants_user ON user.id = meal_participants_user.userId WHERE meal_participants_user.mealId = ? AND user.id = ?",
          [mealId, participantId],
          (err, result) => {
            if (result.length == 0) {
              return next({
                status: 404,
                message: `Participant with id ${participantId} not found for meal with id ${mealId}`,
                data: {},
              });
            }

            res.status(200).json({
              status: 200,
              message: `Participant with id ${participantId} for meal with id ${mealId}`,
              result: result.map(({ password, ...userdata }) => userdata)[0],
            });
          }
        );
      }
    );
  },
};

module.exports = controller;
