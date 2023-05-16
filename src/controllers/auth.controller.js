const pool = require("../../database/dbconnection");
const jwt = require("jsonwebtoken");
const jwtSecretkey = "insaneSecureKey";

let controller = {
  login: (req, res, next) => {
    pool.query(
      "SELECT * FROM user WHERE emailAdress = ?",
      [req.body.emailAddress],
      (err, result) => {
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
};

module.exports = controller;
