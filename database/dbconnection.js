var mysql = require("mysql2");
var dotenv = require("dotenv").config();

var pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  multipleStatements: true,
  typeCast: function castField(field, useDefaultTypeCasting) {
    if (field.type === "TINY" && field.length === 4) {
      return field.string() == 1;
    }

    return useDefaultTypeCasting();
  },
});

module.exports = pool;
