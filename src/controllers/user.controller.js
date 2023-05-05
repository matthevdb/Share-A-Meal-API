const assert = require("assert");
const pool = require("../../database/dbconnection");

// In-memory database
let users = [
  {
    id: 1,
    firstName: "Matthé",
    lastName: "van den Berg",
    emailAdress: "mat.vandenberg@student.avans.nl",
  },
  {
    id: 2,
    firstName: "Robin",
    lastName: "Schellius",
    emailAdress: "r.schellius@avans.nl",
  },
];
let index = users.length;

let controller = {
  validateUser: (req, res, next) => {
    let { firstName, lastName, emailAdress } = req.body;

    try {
      assert(typeof firstName === "string", "firstName must be a string");
      assert(typeof lastName === "string", "lastName must be a string");
      assert(typeof emailAdress === "string", "emailAdress must be a string");

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
    let { firstName, lastName, emailAdress } = req.body;

    pool.getConnection((error, connection) => {
      connection.query(
        "INSERT INTO user (firstName, lastName, emailAdress) VALUES (?, ?, ?)",
        [firstName, lastName, emailAdress],
        (error, result) => {
          if (error) {
            if (error.code == "ER_DUP_ENTRY") {
              const error = {
                status: 403,
                message: `User with email adress ${emailAdress} already exists.`,
                data: {},
              };
              next(error);
            } else {
              const error = {
                status: 403,
                message: error.sqlMessage,
                data: {},
              };
            }
          } else {
            const id = result.insertId;

            connection.query(
              "SELECT id, firstName, lastName, emailAdress FROM user WHERE id = ?",
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
    let filters = req.query;
    let filteredUsers = users.filter((user) => {
      let isValid = true;
      for (key in filters) {
        console.log(key, user[key], filters[key]);
        isValid =
          isValid &&
          user[key].toString().toLowerCase() ==
            filters[key].toString().toLowerCase();
      }
      return isValid;
    });
    if (filteredUsers.length > 0) {
      res.status(200).json({
        status: 200,
        message: "Users found matching the search parameters.",
        data: filteredUsers,
      });
    } else {
      const error = {
        status: 404,
        message: "No users found matching the search parameters.",
        data: {},
      };

      next(error);
    }
  },
  getUserProfile: (req, res) => {
    res.status(200).json({
      status: 200,
      message: "Personal user profile succesfully returned.",
      data: users[0],
    });
  },
  getUserByID: (req, res, next) => {
    let id = req.params.id;
    let user = users.filter((user) => user.id == id);
    if (user.length > 0) {
      res.status(200).json({
        status: 200,
        message: `User with id ${id} found.`,
        data: user,
      });
    } else {
      const error = {
        status: 404,
        message: `User with id ${id} not found.`,
        data: {},
      };

      next(error);
    }
  },
  changeUserData: (req, res, next) => {
    let id = req.params.id;
    let { firstName, lastName, emailAdress } = req.body;
    let userId = users.findIndex((user) => user.id == id);

    let changedUser = {
      id: id,
      firstName: firstName,
      lastName: lastName,
      emailAdress: emailAdress,
    };

    users[userId] = changedUser;

    if (userId == -1) {
      const error = {
        status: 404,
        message: `User with id ${id} not found.`,
        data: {},
      };

      next(error);
    } else {
      res.status(201).json({
        status: 201,
        message: `Updated user with id ${id}.`,
        data: changedUser,
      });
    }
  },
  deleteUser: (req, res, next) => {
    let id = req.params.id;
    let userId = users.findIndex((user) => user.id == id);

    if (userId == -1) {
      const error = {
        status: 404,
        message: `User with id ${id} not found.`,
        data: {},
      };

      next(error);
    } else {
      users.splice(userId, 1);

      res.status(200).json({
        status: 200,
        message: `User with id ${id} deleted.`,
        data: {},
      });
    }
  },
};

module.exports = controller;
