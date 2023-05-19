const pool = require("../../database/dbconnection");

const CLEAR_DATABASE =
  "DELETE FROM meal_participants_user; DELETE FROM meal; DELETE FROM user; ALTER TABLE user AUTO_INCREMENT = 1; ALTER TABLE meal AUTO_INCREMENT = 1";

beforeEach((done) => {
  pool.query(CLEAR_DATABASE, () => {
    done();
  });
});

after(() => {
  pool.end();
});
