const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../server");
const pool = require("../../database/dbconnection");
chai.should();
chai.use(chaiHttp);

const INSERT_USER =
  "INSERT INTO user (firstName, lastName, street, city, emailAdress, password, phoneNumber) " +
  "VALUES ('Matthé', 'van den Berg', 'Lovensdijkstraat 61', 'Breda', 'm.vandenberg@avans.nl', 'Secret12', '06 12345678');";

describe("UC-101 Logging in", function () {
  beforeEach((done) => {
    pool.query(INSERT_USER, (error, result) => {
      done();
    });
  });

  it("TC-101-1 should return an error if a required field is missing", (done) => {
    chai
      .request(server)
      .post("/api/login")
      .send({
        emailAddress: "m.vandenberg@avans.nl",
      })
      .end((err, res) => {
        res.body.should.be.an("object");
        res.body.should.has.property("status").to.be.equal(400);
        res.body.should.has
          .property("message")
          .to.be.equal("password must be a string");
        res.body.should.has.property("data").to.be.empty;
        done();
      });
  });
  it("TC-101-2 should return an error if password is invalid", (done) => {
    chai
      .request(server)
      .post("/api/login")
      .send({
        emailAddress: "m.vandenberg@avans.nl",
        password: "123",
      })
      .end((err, res) => {
        res.body.should.be.an("object");
        res.body.should.has.property("status").to.be.equal(400);
        res.body.should.has
          .property("message")
          .to.be.equal("Emailaddress and password do not match");
        res.body.should.has.property("data").to.be.empty;
        done();
      });
  });
  it("TC-101-3 should return an error if user does not exist", (done) => {
    chai
      .request(server)
      .post("/api/login")
      .send({
        emailAddress: "n.vandenberg@avans.nl",
        password: "Secret12",
      })
      .end((err, res) => {
        res.body.should.be.an("object");
        res.body.should.has.property("status").to.be.equal(404);
        res.body.should.has
          .property("message")
          .to.be.equal("User does not exist");
        res.body.should.has.property("data").to.be.empty;
        done();
      });
  });
  it("TC-101-4 should have successfully logged in the user", (done) => {
    chai
      .request(server)
      .post("/api/login")
      .send({
        emailAddress: "m.vandenberg@avans.nl",
        password: "Secret12",
      })
      .end((err, res) => {
        res.body.should.be.an("object");
        res.body.should.has.property("status").to.be.equal(200);
        res.body.should.has.property("message").to.be.equal("User logged in");
        res.body.should.has.property("data").to.include({
          id: 1,
          firstName: "Matthé",
          lastName: "van den Berg",
          street: "Lovensdijkstraat 61",
          city: "Breda",
          isActive: true,
          emailAdress: "m.vandenberg@avans.nl",
          phoneNumber: "06 12345678",
        });
        res.body.data.should.have.property("token").to.be.a.string;
        done();
      });
  });
});
