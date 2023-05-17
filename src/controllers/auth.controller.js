const pool = require("../../database/dbconnection");
const jwt = require("jsonwebtoken");
const jwtSecretkey = "insaneSecureKey";
const assert = require("assert");

let controller = {
  validateLoginBody: (req, res, next) => {
    let { emailAddress, password } = req.body;

    try {
      assert(typeof emailAddress === "string", "emailAddress must be a string");
      assert(typeof password === "string", "password must be a string");

      next();
    } catch (error) {
      next({
        status: 400,
        message: error.message,
        data: {},
      });
    }
  },
  login: (req, res, next) => {
    pool.query(
      "SELECT * FROM user WHERE emailAdress = ?",
      [req.body.emailAddress],
      (err, result) => {
        result = result.map((item) => ({
          ...item,
          isActive: item.isActive == 1,
        }));

        if (err || result.length == 0) {
          next({
            status: 404,
            message: "User does not exist",
            data: {},
          });
        } else {
          const { password, ...userinfo } = result[0];

          if (req.body.password !== password) {
            next({
              status: 400,
              message: "Emailaddress and password do not match",
              data: {},
            });

            return;
          }

          const payload = {
            userId: userinfo.id,
          };

          jwt.sign(payload, jwtSecretkey, { expiresIn: "2d" }, (err, token) => {
            res.status(200).json({
              status: 200,
              message: "User logged in",
              data: { ...userinfo, token },
            });
          });
        }
      }
    );
  },
  validateToken: (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      next({
        status: 401,
        message: "Not authorized",
        data: {},
      });
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, jwtSecretkey, (err, payload) => {
      if (err) {
        next({ status: 401, message: "Invalid token", data: {} });
      }

      req.userId = payload.userId;
      next();
    });
  },
};

module.exports = controller;
