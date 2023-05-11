const assert = require("assert");
const pool = require("../../database/dbconnection");

let controller = {
  validateUser: (req, res, next) => {
    let {
      firstName,
      lastName,
      street,
      city,
      isActive,
      emailAdress,
      password,
      phoneNumber,
    } = req.body;

    try {
      req.body.isActive =
        req.body.isActive !== undefined ? parseInt(req.body.isActive) : 1;

      if (isActive) {
        assert(typeof isActive === "number", "isActive must be an int");
      }

      assert(typeof firstName === "string", "firstName must be a string");
      assert(typeof lastName === "string", "lastName must be a string");
      assert(typeof street === "string", "street must be a string");
      assert(typeof city === "string", "city must be a string");
      assert(typeof emailAdress === "string", "emailAdress must be a string");
      assert(typeof password === "string", "password must be a string");
      assert(typeof phoneNumber === "string", "phoneNumber must be a string");

      if (!emailAdress.match(/^[a-z]{1}\.[a-z]{2,}@[a-z]{2,}\.[a-z]{2,3}$/gm)) {
        const error = {
          status: 400,
          message: "You must provide a valid emailaddress",
          data: {},
        };

        next(error);
      }

      if (!password.match(/^(?=.*[A-Z])(?=.*\d).{8,}$/gm)) {
        const error = {
          status: 400,
          message: "You must provide a valid password",
          data: {},
        };

        next(error);
      }

      if (!phoneNumber.match("[0-9]{5,15}")) {
        const error = {
          status: 400,
          message: "You must provide a valid phone number",
          data: {},
        };

        next(error);
      }

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
  addUser: (req, res, next) => {
    let {
      firstName,
      lastName,
      street,
      city,
      isActive,
      emailAdress,
      password,
      phoneNumber,
    } = req.body;

    pool.getConnection((error, connection) => {
      connection.query(
        "INSERT INTO user (firstName, lastName, street, city, isActive, emailAdress, password, phoneNumber) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [
          firstName,
          lastName,
          street,
          city,
          isActive,
          emailAdress,
          password,
          phoneNumber,
        ],
        (err, result) => {
          if (err) {
            if (err.code == "ER_DUP_ENTRY") {
              const error = {
                status: 403,
                message: `User with email adress ${emailAdress} already exists.`,
                data: {},
              };

              next(error);
            } else {
              const error = {
                status: 403,
                message: err.sqlMessage,
                data: {},
              };

              next(error);
            }
          } else {
            const id = result.insertId;

            connection.query(
              "SELECT * FROM user WHERE id = ?",
              id,
              (error, result) => {
                res.status(201).json({
                  status: 201,
                  message: `Added user with id ${id}.`,
                  data: result[0],
                });
              }
            );
          }
        }
      );

      connection.release();
    });
  },
  getAllUsers: (req, res, next) => {
    let query = req.query;
    id = query.id || "%";
    firstName = query.firstName || "%";
    lastName = query.lastName || "%";
    street = query.street || "%";
    city = query.city || "%";
    isActive = query.isActive || "%";
    emailAdress = query.emailAdress || "%";
    phoneNumber = query.phoneNumber || "%";

    pool.getConnection((error, connection) => {
      connection.query(
        "SELECT id, firstName, lastName, street, city, isActive, emailAdress, phoneNumber FROM user WHERE id LIKE ? AND firstName LIKE ? AND lastName LIKE ? and street LIKE ? AND city LIKE ? AND isActive LIKE ? AND emailAdress LIKE ? AND phoneNumber LIKE ?;",
        [
          id,
          firstName,
          lastName,
          street,
          city,
          isActive,
          emailAdress,
          phoneNumber,
        ],
        (error, result) => {
          if (result.length == 0) {
            const error = {
              status: 404,
              message: "No users found matching the search parameters.",
              data: {},
            };

            next(error);
          } else {
            res.status(200).json({
              status: 200,
              message: "Users found matching the search parameters.",
              data: result,
            });
          }
        }
      );
      connection.release();
    });
  },
  getUserProfile: (req, res) => {
    res.status(404).json({
      status: 404,
      message: "This functionality has not been implemented yet.",
      data: {},
    });
  },
  getUserByID: (req, res, next) => {
    let id = req.params.id;

    pool.query(
      "SELECT id, firstName, lastName, street, city, isActive, emailAdress, phoneNumber FROM user WHERE id = ?",
      id,
      (error, result) => {
        if (result.length == 0) {
          const error = {
            status: 404,
            message: `User with id ${id} not found.`,
            data: {},
          };

          next(error);
        } else {
          res.status(200).json({
            status: 200,
            message: `User with id ${id} found.`,
            data: result[0],
          });
        }
      }
    );
  },
  updateUserData: (req, res, next) => {
    let id = req.params.id;
    let {
      firstName,
      lastName,
      street,
      city,
      isActive,
      emailAdress,
      password,
      phoneNumber,
    } = req.body;

    pool.getConnection((error, connection) => {
      connection.query(
        "UPDATE user SET firstName = ?, lastName = ?, street = ?, city = ?, isActive = ?, emailAdress = ?, password = ?, phoneNumber = ? WHERE id = ?",
        [
          firstName,
          lastName,
          street,
          city,
          isActive,
          emailAdress,
          password,
          phoneNumber,
          id,
        ],
        (err, result) => {
          if (err) {
            const error = {
              status: 404,
              message: err.sqlMessage,
              data: {},
            };

            next(error);
          } else if (result.affectedRows == 0) {
            const error = {
              status: 404,
              message: `User with id ${id} not found.`,
              data: {},
            };

            next(error);
          } else {
            pool.query(
              "SELECT * FROM user WHERE id = ?",
              id,
              (error, result) => {
                res.status(200).json({
                  status: 200,
                  message: `Updated user with id ${id}.`,
                  data: result[0],
                });
              }
            );
          }
        }
      );
      connection.release();
    });
  },
  deleteUser: (req, res, next) => {
    let id = req.params.id;

    pool.getConnection((error, connection) => {
      connection.query(
        "DELETE FROM user WHERE id = ?",
        [id],
        (error, result) => {
          if (result.affectedRows == 0) {
            const error = {
              status: 404,
              message: `User with id ${id} not found.`,
              data: {},
            };

            next(error);
          } else {
            res.status(200).json({
              status: 200,
              message: `User with id ${id} deleted.`,
              data: {},
            });
          }
        }
      );
      connection.release();
    });
  },
};

module.exports = controller;
