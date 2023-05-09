const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../server");
const pool = require("../../database/dbconnection");
chai.should();
chai.use(chaiHttp);

describe("UC-201 Register as new user", function () {
  beforeEach((done) => {
    pool.query(
      "DELETE FROM meal_participants_user; DELETE FROM meal; DELETE FROM user",
      (err) => {
        if (err) return done(err);
        done();
      }
    );
  });

  describe("TC-201-5 User succesfully registered", function () {
    let userId;
    it("should return relevant response", (done) => {
      chai
        .request(server)
        .post("/api/user")
        .send({
          firstName: "Matthé",
          lastName: "van den Berg",
          emailAdress: "mat.vandenberg@student.avans.nl",
        })
        .end((err, res) => {
          let { data, message } = res.body;
          userId = data.id;
          res.body.should.be.an("object");
          res.body.should.has.property("data");
          res.body.should.has.property("status").to.be.equal(201);
          res.body.should.has
            .property("message")
            .to.be.equal(`Added user with id ${userId}.`);
          data.should.deep.include({
            id: userId,
            firstName: "Matthé",
            lastName: "van den Berg",
            emailAdress: "mat.vandenberg@student.avans.nl",
          });
          done();
        });
    });
  });
});
describe("UC-202 Requesting an overview of users", function () {
  describe("TC-202-1 Display all users", function () {
    it("should return atleast 2 users", (done) => {
      chai
        .request(server)
        .get("/api/user")
        .end((err, res) => {
          res.body.should.be.an("object");
          res.body.should.has.property("status").to.be.equal(200);
          res.body.should.has.property("message");
          res.body.should.has.property("data");
          let { data, message } = res.body;
          message.should.be.equal(
            "Users found matching the search parameters."
          );
          data.should.be.an("array").with.lengthOf.at.least(2);
          done();
        });
    });
  });
});
describe("UC-203 Requesting the user profile", function () {
  describe("TC-203-2 User has logged in with valid token", function () {
    it("should return user data", (done) => {
      chai
        .request(server)
        .get("/api/user/profile")
        .end((err, res) => {
          res.body.should.be.an("object");
          res.body.should.has.property("status").to.be.equal(200);
          res.body.should.has.property("message");
          res.body.should.has.property("data");
          let { data, message } = res.body;
          message.should.be.equal(
            "Personal user profile succesfully returned."
          );
          data.should.deep.include({
            id: 1,
            firstName: "Matthé",
            lastName: "van den Berg",
            emailAdress: "mat.vandenberg@student.avans.nl",
          });
          done();
        });
    });
  });
});
describe("UC-204 Request user data by ID", function () {
  describe("TC-204-3 User ID exists", function () {
    it("should return user data", (done) => {
      chai
        .request(server)
        .get("/api/user/1")
        .end((err, res) => {
          res.body.should.be.an("object");
          res.body.should.has.property("status").to.be.equal(200);
          res.body.should.has.property("message");
          res.body.should.has.property("data");
          let { data, message } = res.body;
          message.should.be.equal("User with id 1 found.");
          data.should.be.an("array").to.deep.include({
            id: 1,
            firstName: "Matthé",
            lastName: "van den Berg",
            emailAdress: "mat.vandenberg@student.avans.nl",
          });
          done();
        });
    });
  });
});
describe("UC-206 Deleting a user", function () {
  describe("TC-206-4 User succesfully deleted", function () {
    it("should have deleted the user", (done) => {
      chai
        .request(server)
        .delete("/api/user/1")
        .end((err, res) => {
          res.body.should.be.an("object");
          res.body.should.has.property("status").to.be.equal(200);
          res.body.should.has.property("message");
          res.body.should.has.property("data");
          let { data, message } = res.body;
          message.should.be.equal("User with id 1 deleted.");
          data.should.be.an("object").to.be.empty;

          chai
            .request(server)
            .get("/api/user/1")
            .end((err, res) => {
              res.body.should.be.an("object");
              res.body.should.has.property("status").to.be.equal(404);
              res.body.should.has.property("message");
              res.body.should.has.property("data").to.be.empty;
              let { data, message } = res.body;
              message.should.be.equal("User with id 1 not found.");
            });
          done();
        });
    });
  });
});
