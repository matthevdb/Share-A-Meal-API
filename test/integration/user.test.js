const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../server");
const pool = require("../../database/dbconnection");
const { it } = require("mocha");
chai.should();
chai.use(chaiHttp);

const CLEAR_DATABASE =
  "DELETE FROM meal_participants_user; DELETE FROM meal; DELETE FROM user; ALTER TABLE user AUTO_INCREMENT = 1";
const INSERT_USER =
  "INSERT INTO user (firstName, lastName, street, city, emailAdress, password, phoneNumber) " +
  "VALUES ('Matthé', 'van den Berg', 'Lovensdijkstraat 61', 'Breda', 'm.vandenberg@avans.nl', 'secret', '12345678901');";
const INSERT_FOUR_USERS =
  "INSERT INTO user (firstName, lastName, street, city, isActive, emailAdress, password, phoneNumber) " +
  "VALUES ('Matthé', 'van den Berg', 'Lovensdijkstraat 61', 'Breda', 1, 'm.vandenberg@avans.nl', 'secret', '12345678901'), " +
  "('John', 'Doe', 'Lovensdijkstraat 61', 'Breda', 1, 'j.doe@avans.nl', 'secret', '09876543210'), " +
  "('John', 'Doe', 'Lovensdijkstraat 61', 'Breda', 0, 'x.inactive@avans.nl', 'secret', '09847653210'), " +
  "('John', 'Doe', 'Lovensdijkstraat 61', 'Breda', 0, 'x.inactivetwo@avans.nl', 'secret', '09021374586');";

beforeEach((done) => {
  pool.query(CLEAR_DATABASE, (err) => {
    if (err) return done(err);
    done();
  });
});

after(() => {
  pool.end();
});

describe("UC-201 Register as new user", function () {
  it("TC-201-1 should not accept missing fields", (done) => {
    chai
      .request(server)
      .post("/api/user")
      .send({
        firstName: "Matthé",
        lastName: "van den Berg",
        street: "Lovensdijkstraat 61",
        // Missing city
        password: "secret",
        emailAdress: "mat.vandenberg@student.avans.nl",
        phoneNumber: "12345678901",
      })
      .end((err, res) => {
        res.body.should.be.an("object");
        res.body.should.has.property("status").to.be.equal(400);
        res.body.should.has
          .property("message")
          .to.be.equal("city must be a string");
        res.body.should.has.property("data").to.be.empty;
        done();
      });
  });
  it("TC-201-2 should not accept an invalid emailaddress", (done) => {
    chai
      .request(server)
      .post("/api/user")
      .send({
        firstName: "Matthé",
        lastName: "van den Berg",
        street: "Lovensdijkstraat 61",
        city: "Breda",
        password: "secret",
        emailAdress: "invalid.emailadress@",
        phoneNumber: "12345678901",
      })
      .end((err, res) => {
        res.body.should.be.an("object");
        res.body.should.has.property("status").to.be.equal(400);
        res.body.should.has
          .property("message")
          .to.be.equal("You must provide a valid emailaddress");
        res.body.should.has.property("data").to.be.empty;
        done();
      });
  });
  it("TC-201-3 should not accept an invalid password", (done) => {
    chai
      .request(server)
      .post("/api/user")
      .send({
        firstName: "Matthé",
        lastName: "van den Berg",
        street: "Lovensdijkstraat 61",
        city: "Breda",
        password: "!$8a",
        emailAdress: "m.vandenberg@avans.nl",
        phoneNumber: "12345678901",
      })
      .end((err, res) => {
        res.body.should.be.an("object");
        res.body.should.has.property("status").to.be.equal(400);
        res.body.should.has
          .property("message")
          .to.be.equal("Password must be atleast 5 characters long");
        res.body.should.has.property("data").to.be.empty;
        done();
      });
  });
  it("TC-201-4 should return an error if user already exists", (done) => {
    chai
      .request(server)
      .post("/api/user")
      .send({
        firstName: "Matthé",
        lastName: "van den Berg",
        street: "Lovensdijkstraat 61",
        city: "Breda",
        password: "secret",
        emailAdress: "m.vandenberg@avans.nl",
        phoneNumber: "12345678901",
      })
      .end();

    chai
      .request(server)
      .post("/api/user")
      .send({
        firstName: "Matthé",
        lastName: "van den Berg",
        street: "Lovensdijkstraat 61",
        city: "Breda",
        password: "secret",
        emailAdress: "m.vandenberg@avans.nl",
        phoneNumber: "12345678901",
      })
      .end((err, res) => {
        res.body.should.be.an("object");
        res.body.should.has.property("status").to.be.equal(403);
        res.body.should.has
          .property("message")
          .to.be.equal(
            "User with email adress m.vandenberg@avans.nl already exists."
          );
        res.body.should.has.property("data").to.be.empty;
        done();
      });
  });
  it("TC-201-5 should have succesfully registered the user", (done) => {
    chai
      .request(server)
      .post("/api/user")
      .send({
        firstName: "Matthé",
        lastName: "van den Berg",
        street: "Lovensdijkstraat 61",
        city: "Breda",
        password: "secret",
        emailAdress: "m.vandenberg@avans.nl",
        phoneNumber: "12345678901",
      })
      .end((err, res) => {
        res.body.should.be.an("object");
        res.body.should.has.property("status").to.be.equal(201);
        res.body.should.has
          .property("data")
          .to.be.an("object")
          .to.deep.include({
            firstName: "Matthé",
            lastName: "van den Berg",
            street: "Lovensdijkstraat 61",
            city: "Breda",
            emailAdress: "m.vandenberg@avans.nl",
            password: "secret",
            phoneNumber: "12345678901",
          });
        res.body.data.should.has.property("id");
        res.body.should.has
          .property("message")
          .to.be.equal(`Added user with id ${res.body.data.id}.`);
        done();
      });
  });
});
describe("UC-202 Requesting an overview of users", function () {
  beforeEach((done) => {
    pool.query(INSERT_FOUR_USERS, (error, result) => {
      done();
    });
  });

  it("TC-202-1 should display all users", (done) => {
    chai
      .request(server)
      .get("/api/user")
      .end((err, res) => {
        res.body.should.be.an("object");
        res.body.should.has.property("status").to.be.equal(200);
        res.body.should.has.property("message");
        res.body.should.has.property("data");
        let { data, message } = res.body;
        message.should.be.equal("Users found matching the search parameters.");
        data.should.be.an("array").with.lengthOf.at.least(2);
        done();
      });
  });
  it("TC-202-2 should return users with search term on non-existent fields.", function (done) {
    chai
      .request(server)
      .get(
        "/api/user?nonexistingfield=acertainvalue&anotherfield=anothercertainvalue"
      )
      .end((err, res) => {
        res.body.should.be.an("object");
        res.body.should.has.property("status").to.be.equal(200);
        res.body.should.has.property("message");
        res.body.should.has.property("data");
        let { data, message } = res.body;
        message.should.be.equal("Users found matching the search parameters.");
        data.should.be.an("array").with.lengthOf(4);
        done();
      });
  });
  it("TC-202-3 should return 2 users when filtering on isActive = false", function (done) {
    chai
      .request(server)
      .get("/api/user?isActive=0")
      .end((err, res) => {
        res.body.should.be.an("object");
        res.body.should.has.property("status").to.be.equal(200);
        res.body.should.has.property("message");
        res.body.should.has.property("data");
        let { data, message } = res.body;
        message.should.be.equal("Users found matching the search parameters.");
        data.should.be.an("array").with.lengthOf(2);
        done();
      });
  });
  it("TC-202-4 should return 2 users when filtering on isActive = true", function (done) {
    chai
      .request(server)
      .get("/api/user?isActive=1")
      .end((err, res) => {
        res.body.should.be.an("object");
        res.body.should.has.property("status").to.be.equal(200);
        res.body.should.has.property("message");
        res.body.should.has.property("data");
        let { data, message } = res.body;
        message.should.be.equal("Users found matching the search parameters.");
        data.should.be.an("array").with.lengthOf(2);
        done();
      });
  });
  it("TC-202-5 should return users when filtering on existing fields", function (done) {
    chai
      .request(server)
      .get("/api/user?firstName=John&lastName=Doe")
      .end((err, res) => {
        res.body.should.be.an("object");
        res.body.should.has.property("status").to.be.equal(200);
        res.body.should.has.property("message");
        res.body.should.has.property("data");
        let { data, message } = res.body;
        message.should.be.equal("Users found matching the search parameters.");
        data.should.be.an("array").with.lengthOf(3);
        done();
      });
  });
});
describe("UC-203 Requesting the user profile", function () {
  describe.skip("TC-203-1 should not return user profile when token is invalid", function () {
    // To be implemented
  });
  describe("TC-203-2 User has logged in with valid token", function () {
    it("should return user data", (done) => {
      chai
        .request(server)
        .get("/api/user/profile")
        .end((err, res) => {
          res.body.should.be.an("object");
          res.body.should.has.property("status").to.be.equal(404);
          res.body.should.has.property("message");
          res.body.should.has.property("data");
          let { data, message } = res.body;
          message.should.be.equal(
            "This functionality has not been implemented yet."
          );
          data.should.be.an("object").to.be.empty;
          done();
        });
    });
  });
});
describe("UC-204 Request user data by ID", function () {
  let userID;

  beforeEach((done) => {
    pool.query(INSERT_USER, (error, result) => {
      userID = result.insertId;
      done();
    });
  });

  it.skip("TC-204-1 should not return user when token is invalid", function (done) {
    // To be implemented
  });

  it("TC-204-2 should not return user data when userID does not exist", function (done) {
    chai
      .request(server)
      .get(`/api/user/2`)
      .end((err, res) => {
        res.body.should.has.property("status").to.be.equal(404);
        res.body.should.has.property("message");
        res.body.should.has.property("data");
        res.body.message.should.be.equal(`User with id 2 not found.`);
        res.body.data.should.be.an("object").to.be.empty;
        done();
      });
  });

  it("TC-204-3 should return user data when userID exists", function (done) {
    chai
      .request(server)
      .get(`/api/user/${userID}`)
      .end((err, res) => {
        res.body.should.be.an("object");
        res.body.should.has.property("status").to.be.equal(200);
        res.body.should.has.property("message");
        res.body.should.has.property("data");
        let { data, message } = res.body;
        message.should.be.equal(`User with id ${userID} found.`);
        data.should.be.an("object").to.deep.include({
          id: userID,
          firstName: "Matthé",
          lastName: "van den Berg",
          street: "Lovensdijkstraat 61",
          city: "Breda",
          isActive: 1,
          emailAdress: "m.vandenberg@avans.nl",
          phoneNumber: "12345678901",
        });
        done();
      });
  });
});
describe("UC-205 Updating user data", () => {
  let userID;

  beforeEach((done) => {
    pool.query(INSERT_USER, (error, result) => {
      userID = result.insertId;
      done();
    });
  });

  it("TC-205-1 should not update when required field emailAddress is missing", (done) => {
    chai
      .request(server)
      .put(`/api/user/${userID}`)
      .send({
        firstName: "Matthé",
        lastName: "van den Berg",
        street: "Lovensdijkstraat 61",
        city: "Breda",
        password: "secret",
        phoneNumber: "12345678901",
      })
      .end((err, res) => {
        res.body.should.be.an("object");
        res.body.should.has.property("status").to.be.equal(400);
        res.body.should.has
          .property("message")
          .to.be.equal("emailAdress must be a string");
        res.body.should.has.property("data").to.be.empty;
        done();
      });
  });
  it.skip("TC-205-2 should not update when logged-in user does not own the data", (done) => {
    // To be implemented
  });
  it("TC-205-3 should not update when phoneNumber is invalid", (done) => {
    chai
      .request(server)
      .put(`/api/user/${userID}`)
      .send({
        firstName: "Matthé",
        lastName: "van den Berg",
        street: "Lovensdijkstraat 61",
        city: "Breda",
        emailAdress: "m.vandenberg@avans.nl",
        password: "secret",
        phoneNumber: "",
      })
      .end((err, res) => {
        res.body.should.be.an("object");
        res.body.should.has.property("status").to.be.equal(400);
        res.body.should.has
          .property("message")
          .to.be.equal("You must provide a valid phone number");
        res.body.should.has.property("data").to.be.empty;
        done();
      });
  });
  it("TC-205-4 should not update a non-existing user", (done) => {
    chai
      .request(server)
      .put(`/api/user/2`)
      .send({
        firstName: "Matthé",
        lastName: "van den Berg",
        street: "Lovensdijkstraat 61",
        city: "Breda",
        emailAdress: "m.vandenberg@avans.nl",
        password: "secret",
        phoneNumber: "12345678901",
      })
      .end((err, res) => {
        res.body.should.be.an("object");
        res.body.should.has.property("status").to.be.equal(404);
        res.body.should.has
          .property("message")
          .to.be.equal(`User with id 2 not found.`);
        res.body.should.has.property("data").to.be.empty;
        done();
      });
  });
  it.skip("TC-205-5 should not update when user is not logged in", (done) => {
    // To be implemented
  });
  it("TC-205-6 should have succesfully updated the user", (done) => {
    chai
      .request(server)
      .put(`/api/user/${userID}`)
      .send({
        firstName: "Matthé",
        lastName: "van den Berg",
        street: "Lovensdijkstraat 61",
        city: "Breda",
        emailAdress: "m.vandenberg@avans.nl",
        password: "secret",
        phoneNumber: "12345678901",
      })
      .end((err, res) => {
        res.body.should.be.an("object");
        res.body.should.has.property("status").to.be.equal(200);
        res.body.should.has
          .property("message")
          .to.be.equal(`Updated user with id ${userID}.`);
        res.body.should.has
          .property("data")
          .to.be.an("object")
          .to.deep.include({
            firstName: "Matthé",
            lastName: "van den Berg",
            street: "Lovensdijkstraat 61",
            city: "Breda",
            emailAdress: "m.vandenberg@avans.nl",
            password: "secret",
            phoneNumber: "12345678901",
          });
        res.body.data.should.has.property("id").to.equal(userID);
        done();
      });
  });
});
describe("UC-206 Deleting a user", function () {
  let userID;

  beforeEach((done) => {
    pool.query(INSERT_USER, (error, result) => {
      userID = result.insertId;
      done();
    });
  });

  it("TC-206-1 should not delete a non-existing user", (done) => {
    chai
      .request(server)
      .delete(`/api/user/2`)
      .end((err, res) => {
        res.body.should.be.an("object");
        res.body.should.has.property("status").to.be.equal(404);
        res.body.should.has.property("message");
        res.body.should.has.property("data");
        res.body.message.should.be.equal(`User with id 2 not found.`);
        res.body.data.should.be.an("object").to.be.empty;
        done();
      });
  });
  it.skip("TC-206-2 should not delete when user is not logged in", (done) => {
    // To be implemented
  });
  it.skip("TC-206-3 should not delete when logged-in user does not own the data", (done) => {
    // To be implemented
  });
  it("TC-206-4 should have succesfully deleted the user", (done) => {
    chai
      .request(server)
      .delete(`/api/user/${userID}`)
      .end((err, res) => {
        res.body.should.be.an("object");
        res.body.should.has.property("status").to.be.equal(200);
        res.body.should.has.property("message");
        res.body.should.has.property("data");
        res.body.message.should.be.equal(`User with id ${userID} deleted.`);
        res.body.data.should.be.an("object").to.be.empty;
        done();
      });
  });
});
