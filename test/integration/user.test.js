const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../server");
const pool = require("../../database/dbconnection");
const { it } = require("mocha");
chai.should();
chai.use(chaiHttp);

const INSERT_TWO_USERS =
  "INSERT INTO user (firstName, lastName, street, city, emailAdress, password, phoneNumber) " +
  "VALUES ('Matthé', 'van den Berg', 'Lovensdijkstraat 61', 'Breda', 'm.vandenberg@avans.nl', 'Secret12', '06 12345678'), " +
  "('John', 'Doe', 'Lovensdijkstraat 61', 'Breda', 'j.doe@avans.nl', 'Secret12', '06 12345678');";
const INSERT_USER =
  "INSERT INTO user (firstName, lastName, street, city, emailAdress, password, phoneNumber) " +
  "VALUES ('Matthé', 'van den Berg', 'Lovensdijkstraat 61', 'Breda', 'm.vandenberg@avans.nl', 'Secret12', '06 12345678');";
const INSERT_FOUR_USERS =
  "INSERT INTO user (firstName, lastName, street, city, isActive, emailAdress, password, phoneNumber) " +
  "VALUES ('Matthé', 'van den Berg', 'Lovensdijkstraat 61', 'Breda', 1, 'm.vandenberg@avans.nl', 'Secret12', '06 12345678'), " +
  "('John', 'Doe', 'Lovensdijkstraat 61', 'Breda', 1, 'j.doe@avans.nl', 'Secret12', '06 12345678'), " +
  "('John', 'Doe', 'Lovensdijkstraat 61', 'Breda', 0, 'x.inactive@avans.nl', 'Secret12', '06 12345678'), " +
  "('John', 'Doe', 'Lovensdijkstraat 61', 'Breda', 0, 'x.inactivetwo@avans.nl', 'Secret12', '06 12345678');";

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
        password: "Secret12",
        emailAdress: "mat.vandenberg@student.avans.nl",
        phoneNumber: "06 12345678",
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
        password: "Secret12",
        emailAdress: "invalid.emailadress@",
        phoneNumber: "06 12345678",
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
        password: "Secret1",
        emailAdress: "m.vandenberg@avans.nl",
        phoneNumber: "06 12345678",
      })
      .end((err, res) => {
        res.body.should.be.an("object");
        res.body.should.has.property("status").to.be.equal(400);
        res.body.should.has
          .property("message")
          .to.be.equal("You must provide a valid password");
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
        password: "Secret12",
        emailAdress: "m.vandenberg@avans.nl",
        phoneNumber: "06 12345678",
      })
      .end((req, res) => {
        chai
          .request(server)
          .post("/api/user")
          .send({
            firstName: "Matthé",
            lastName: "van den Berg",
            street: "Lovensdijkstraat 61",
            city: "Breda",
            password: "Secret12",
            emailAdress: "m.vandenberg@avans.nl",
            phoneNumber: "06 12345678",
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
        password: "Secret12",
        emailAdress: "m.vandenberg@avans.nl",
        phoneNumber: "06 12345678",
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
            password: "Secret12",
            phoneNumber: "06 12345678",
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
  let token;

  beforeEach((done) => {
    pool.query(INSERT_FOUR_USERS, () => {
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

  it("TC-202-1 should display all users", (done) => {
    chai
      .request(server)
      .get("/api/user")
      .set("authorization", "Bearer " + token)
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
      .set("authorization", "Bearer " + token)
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
  it("TC-202-3 should return 2 users when filtering on isActive = false", function (done) {
    chai
      .request(server)
      .get("/api/user?isActive=false")
      .set("authorization", "Bearer " + token)
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
  it("TC-202-4 should return 2 users when filtering on isActive = true", function (done) {
    chai
      .request(server)
      .get("/api/user?isActive=true")
      .set("authorization", "Bearer " + token)
      .set("authorization", "Bearer " + token)
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
  it("TC-202-5 should return users when filtering on existing fields", function (done) {
    chai
      .request(server)
      .get("/api/user?firstName=John&lastName=Doe")
      .set("authorization", "Bearer " + token)
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
  let token;

  beforeEach((done) => {
    pool.query(INSERT_USER, () => {
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

  it("TC-203-1 should not return user profile when token is invalid", (done) => {
    chai
      .request(server)
      .get("/api/user/profile")
      .set("authorization", "Bearer dslkjfoiasd.f32jflkd.d")
      .end((err, res) => {
        res.body.should.be.an("object");
        res.body.should.has.property("status").to.be.equal(401);
        res.body.should.has.property("message").to.be.equal("Invalid token");
        res.body.should.has.property("data").to.be.empty;
        done();
      });
  });
  it("TC-203-2 should return user profile when token is valid", (done) => {
    chai
      .request(server)
      .get("/api/user/profile")
      .set("authorization", "Bearer " + token)
      .end((err, res) => {
        res.body.should.be.an("object");
        res.body.should.has.property("status").to.be.equal(200);
        res.body.should.has
          .property("message")
          .to.be.equal("User profile succesfully returned");
        res.body.should.has.property("data").to.contain({
          id: 1,
          firstName: "Matthé",
          lastName: "van den Berg",
          street: "Lovensdijkstraat 61",
          city: "Breda",
          password: "Secret12",
          isActive: true,
          roles: "editor,guest",
          emailAdress: "m.vandenberg@avans.nl",
          phoneNumber: "06 12345678",
        });
        done();
      });
  });
});
describe("UC-204 Request user data by ID", function () {
  let token;

  beforeEach((done) => {
    pool.query(INSERT_USER, () => {
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

  it("TC-204-1 should not return user when token is invalid", function (done) {
    chai
      .request(server)
      .get("/api/user/1")
      .set("authorization", "Bearer dslkjfoiasd.f32jflkd.d")
      .end((err, res) => {
        res.body.should.be.an("object");
        res.body.should.has.property("status").to.be.equal(401);
        res.body.should.has.property("message").to.be.equal("Invalid token");
        res.body.should.has.property("data").to.be.empty;
        done();
      });
  });

  it("TC-204-2 should not return user data when userID does not exist", function (done) {
    chai
      .request(server)
      .get(`/api/user/2`)
      .set("authorization", "Bearer " + token)
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
      .get("/api/user/1")
      .set("authorization", "Bearer " + token)
      .end((err, res) => {
        res.body.should.be.an("object");
        res.body.should.has.property("status").to.be.equal(200);
        res.body.should.has.property("message");
        res.body.should.has.property("data");
        let { data, message } = res.body;
        message.should.be.equal(`User with id 1 found.`);
        data.should.be.an("object").to.deep.include({
          id: 1,
          firstName: "Matthé",
          lastName: "van den Berg",
          street: "Lovensdijkstraat 61",
          city: "Breda",
          isActive: true,
          emailAdress: "m.vandenberg@avans.nl",
          phoneNumber: "06 12345678",
        });
        done();
      });
  });
});
describe("UC-205 Updating user data", () => {
  let token;

  beforeEach((done) => {
    pool.query(INSERT_TWO_USERS, (err, res) => {
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

  it("TC-205-1 should not update when required field emailAddress is missing", (done) => {
    chai
      .request(server)
      .put("/api/user/1")
      .set("authorization", "Bearer " + token)
      .send({
        firstName: "Matthé",
        lastName: "van den Berg",
        street: "Lovensdijkstraat 61",
        city: "Breda",
        password: "Secret12",
        phoneNumber: "06 12345678",
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
  it("TC-205-2 should not update when logged-in user does not own the data", (done) => {
    chai
      .request(server)
      .post("/api/login")
      .send({ emailAddress: "j.doe@avans.nl", password: "Secret12" })
      .end((err, res) => {
        const wrongToken = res.body.data.token;

        chai
          .request(server)
          .put("/api/user/1")
          .set("authorization", "Bearer " + wrongToken)
          .send({
            firstName: "Matthé",
            lastName: "van den Berg",
            street: "Lovensdijkstraat 61",
            city: "Breda",
            emailAdress: "m.vandenberg@avans.nl",
            password: "Secret12",
            phoneNumber: "06 12345678",
          })
          .end((err, res) => {
            res.body.should.be.an("object");
            res.body.should.has.property("status").to.be.equal(403);
            res.body.should.has
              .property("message")
              .to.be.equal("You do not own this data");
            res.body.should.has.property("data").to.be.empty;
            done();
          });
      });
  });
  it("TC-205-3 should not update when phoneNumber is invalid", (done) => {
    chai
      .request(server)
      .put("/api/user/1")
      .set("authorization", "Bearer " + token)
      .send({
        firstName: "Matthé",
        lastName: "van den Berg",
        street: "Lovensdijkstraat 61",
        city: "Breda",
        emailAdress: "m.vandenberg@avans.nl",
        password: "Secret12",
        phoneNumber: "06_12345678",
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
      .put("/api/user/3")
      .set("authorization", "Bearer " + token)
      .send({
        firstName: "Matthé",
        lastName: "van den Berg",
        street: "Lovensdijkstraat 61",
        city: "Breda",
        emailAdress: "m.vandenberg@avans.nl",
        password: "Secret12",
        phoneNumber: "06 12345678",
      })
      .end((err, res) => {
        res.body.should.be.an("object");
        res.body.should.has.property("status").to.be.equal(404);
        res.body.should.has
          .property("message")
          .to.be.equal(`User with id 3 not found.`);
        res.body.should.has.property("data").to.be.empty;
        done();
      });
  });
  it("TC-205-5 should not update when user is not logged in", (done) => {
    chai
      .request(server)
      .put("/api/user/1")
      .send({
        firstName: "Matthé",
        lastName: "van den Berg",
        street: "Lovensdijkstraat 61",
        city: "Breda",
        emailAdress: "m.vandenberg@avans.nl",
        password: "Secret12",
        phoneNumber: "06 12345678",
      })
      .end((err, res) => {
        res.body.should.be.an("object");
        res.body.should.has.property("status").to.be.equal(401);
        res.body.should.has.property("message").to.be.equal("Not authorized");
        res.body.should.has.property("data").to.be.empty;
        done();
      });
  });
  it("TC-205-6 should have succesfully updated the user", (done) => {
    chai
      .request(server)
      .put("/api/user/1")
      .set("authorization", "Bearer " + token)
      .send({
        firstName: "John",
        lastName: "Doe",
        street: "",
        city: "",
        isActive: true,
        emailAdress: "j.doe@server.com",
        password: "Secret12",
        phoneNumber: "06 12425475",
      })
      .end((err, res) => {
        res.body.should.be.an("object");
        res.body.should.has.property("status").to.be.equal(200);
        res.body.should.has
          .property("message")
          .to.be.equal("Updated user with id 1.");
        res.body.should.has.property("data").to.be.an("object").to.include({
          id: 1,
          firstName: "John",
          lastName: "Doe",
          street: "",
          city: "",
          isActive: true,
          emailAdress: "j.doe@server.com",
          password: "Secret12",
          phoneNumber: "06 12425475",
        });
        done();
      });
  });
});
describe("UC-206 Deleting a user", function () {
  let token;

  beforeEach((done) => {
    pool.query(INSERT_TWO_USERS, () => {
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

  it("TC-206-1 should not delete a non-existing user", (done) => {
    chai
      .request(server)
      .delete(`/api/user/3`)
      .set("authorization", "Bearer " + token)
      .end((err, res) => {
        res.body.should.be.an("object");
        res.body.should.has.property("status").to.be.equal(404);
        res.body.should.has.property("message");
        res.body.should.has.property("data");
        res.body.message.should.be.equal(`User with id 3 not found.`);
        res.body.data.should.be.an("object").to.be.empty;
        done();
      });
  });
  it("TC-206-2 should not delete when user is not logged in", (done) => {
    chai
      .request(server)
      .delete("/api/user/1")
      .end((err, res) => {
        res.body.should.be.an("object");
        res.body.should.has.property("status").to.be.equal(401);
        res.body.should.has.property("message").to.be.equal("Not authorized");
        res.body.should.has.property("data").to.be.empty;
        done();
      });
  });
  it("TC-206-3 should not delete when logged-in user does not own the data", (done) => {
    chai
      .request(server)
      .post("/api/login")
      .send({ emailAddress: "j.doe@avans.nl", password: "Secret12" })
      .end((err, res) => {
        const wrongToken = res.body.data.token;

        chai
          .request(server)
          .delete("/api/user/1")
          .set("authorization", "Bearer " + wrongToken)
          .end((err, res) => {
            res.body.should.be.an("object");
            res.body.should.has.property("status").to.be.equal(403);
            res.body.should.has
              .property("message")
              .to.be.equal("You do not own this data");
            res.body.should.has.property("data").to.be.empty;
            done();
          });
      });
  });
  it("TC-206-4 should have succesfully deleted the user", (done) => {
    chai
      .request(server)
      .delete("/api/user/1")
      .set("authorization", "Bearer " + token)
      .end((err, res) => {
        res.body.should.be.an("object");
        res.body.should.has.property("status").to.be.equal(200);
        res.body.should.has
          .property("message")
          .to.be.equal("Gebruiker met ID 1 is verwijderd");
        res.body.should.has.property("data").to.be.empty;
        done();
      });
  });
});
