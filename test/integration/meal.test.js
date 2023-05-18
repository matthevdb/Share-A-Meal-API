const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../server");
const pool = require("../../database/dbconnection");
chai.should();
chai.use(chaiHttp);

const INSERT_USER =
  "INSERT INTO user (firstName, lastName, street, city, emailAdress, password, phoneNumber) " +
  "VALUES ('Matthé', 'van den Berg', 'Lovensdijkstraat 61', 'Breda', 'm.vandenberg@avans.nl', 'Secret12', '06 12345678');";

describe("UC-301 Adding a meal", () => {
  let token;

  beforeEach((done) => {
    pool.query(INSERT_USER, (err, result) => {
      chai
        .request(server)
        .post("/api/login")
        .send({
          emailAddress: "m.vandenberg@avans.nl",
          password: "Secret12",
        })
        .end((err, res) => {
          token = res.body.data.token;
          done();
        });
    });
  });

  it("TC-301-1 should not accept missing fields", (done) => {
    chai
      .request(server)
      .post("/api/meal")
      .set("authorization", "Bearer " + token)
      .send({
        name: "Meal",
        price: 4,
        dateTime: "2023-05-15 14:30",
        maxAmountOfParticipants: 2,
        imageUrl: "www.google.com",
      })
      .end((err, res) => {
        res.body.should.has.property("status").to.be.equal(400);
        res.body.should.has
          .property("message")
          .to.be.equal("description must be a string");
        res.body.should.has.property("data").to.be.empty;
        done();
      });
  });
  it("TC-301-2 should require the user to be logged in", (done) => {
    chai
      .request(server)
      .post("/api/meal")
      .send({
        name: "Meal",
        description: "A delicious meal",
        price: 4,
        dateTime: "2023-05-15 14:30",
        maxAmountOfParticipants: 2,
        imageUrl: "www.google.com",
      })
      .end((err, res) => {
        res.body.should.has.property("status").to.be.equal(401);
        res.body.should.has.property("message").to.be.equal("Not authorized");
        res.body.should.has.property("data").to.be.empty;
        done();
      });
  });
  it("TC-301-3 should have succesfully added the meal", (done) => {
    chai
      .request(server)
      .post("/api/meal")
      .set("authorization", "Bearer " + token)
      .send({
        name: "Meal",
        description: "A delicious meal",
        price: 4,
        dateTime: "2023-05-15 14:30",
        maxAmountOfParticipants: 2,
        imageUrl: "www.google.com",
      })
      .end((err, res) => {
        res.body.should.has.property("status").to.be.equal(201);
        res.body.should.has
          .property("message")
          .to.be.equal(`Added meal with id ${res.body.data.id}`);
        res.body.should.has.property("data").to.contain({
          name: "Meal",
          description: "A delicious meal",
          price: 4,
          dateTime: "2023-05-15 14:30",
          maxAmountOfParticipants: 2,
          imageUrl: "www.google.com",
        });
        done();
      });
  });
});
describe("UC-302 Updating meal data", () => {
  it("TC-302-1 should not accept missing required fields", (done) => {});
  it("TC-302-2 should require the user to be logged in", (done) => {});
  it("TC-302-3 should require the user to be the owner of the meal", (done) => {});
  it("TC-302-4 should not update when meal does not exist", (done) => {});
  it("TC-302-5 should have succesfully updated the meal", (done) => {});
});
describe("UC-303 Retrieving all meals", () => {
  it("TC-303-1 should return a list of all meals", (done) => {});
});
describe("UC-304 Retrieving meal by ID", () => {
  it("TC-304-1 should return an error if meal does not exist", (done) => {});
  it("TC-304-2 should succesfully return the meal details", (done) => {});
});
describe("UC-305 Deleting a meal", () => {
  it("TC-305-1 should require the user to be logged in", (done) => {});
  it("TC-305-2 should require the user to be the owner of the meal", (done) => {});
  it("TC-305-3 should not update when meal does not exist", (done) => {});
  it("TC-305-4 should have succesfully deleted the meal", (done) => {});
});
