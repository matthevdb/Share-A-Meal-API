const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../server");
const pool = require("../../database/dbconnection");
chai.should();
chai.use(chaiHttp);

const INSERT_USER =
  "INSERT INTO user (firstName, lastName, street, city, emailAdress, password, phoneNumber) " +
  "VALUES ('Matthé', 'van den Berg', 'Lovensdijkstraat 61', 'Breda', 'm.vandenberg@avans.nl', 'Secret12', '06 12345678');";
const INSERT_TWO_USERS =
  "INSERT INTO user (firstName, lastName, street, city, emailAdress, password, phoneNumber) " +
  "VALUES ('Matthé', 'van den Berg', 'Lovensdijkstraat 61', 'Breda', 'm.vandenberg@avans.nl', 'Secret12', '06 12345678'), " +
  "('John', 'Doe', 'Lovensdijkstraat 61', 'Breda', 'j.doe@avans.nl', 'Secret12', '06 12345678');";
const INSERT_MEAL =
  "INSERT INTO meal (cookId, dateTime, maxAmountOfParticipants, price, imageUrl, name, description) VALUES (1, '2023-5-15 14:30', 1, 2.5, 'www.google.com', 'Meal', 'A delicious meal');";
const INSERT_TWO_MEALS =
  "INSERT INTO meal (cookId, dateTime, maxAmountOfParticipants, price, imageUrl, name, description) " +
  "VALUES (1, '2023-5-15 14:30', 2, 2.5, 'www.google.com', 'Meal', 'A delicious meal'), " +
  "(1, '2024-5-15 14:30', 5, 15.5, 'www.google.com', 'Second meal', 'Another delicious meal');";
const INSERT_PARTICIPATION =
  "INSERT INTO meal_participants_user (mealId, userId) VALUES (1, 1);";
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
  beforeEach((done) => {
    pool.query(INSERT_TWO_USERS + INSERT_MEAL, (err, result) => {
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

  it("TC-302-1 should not accept missing required fields", (done) => {
    chai
      .request(server)
      .put("/api/meal/1")
      .set("authorization", "Bearer " + token)
      .send({
        name: "Meal",
        description: "Another delicious meal",
        dateTime: "2050-01-30 18:00",
        maxAmountOfParticipants: 5,
        imageUrl: "www.google.com",
      })
      .end((err, res) => {
        res.body.should.has.property("status").to.be.equal(400);
        res.body.should.has
          .property("message")
          .to.be.equal("price must be a number");
        res.body.should.has.property("data").to.be.empty;
        done();
      });
  });
  it("TC-302-2 should require the user to be logged in", (done) => {
    chai
      .request(server)
      .put("/api/meal/1")
      .send({
        name: "Meal",
        description: "Another delicious meal",
        price: 10,
        dateTime: "2050-01-30 18:00",
        maxAmountOfParticipants: 5,
        imageUrl: "www.google.com",
      })
      .end((err, res) => {
        res.body.should.has.property("status").to.be.equal(401);
        res.body.should.has.property("message").to.be.equal("Not authorized");
        res.body.should.has.property("data").to.be.empty;
        done();
      });
  });
  it("TC-302-3 should require the user to be the owner of the meal", (done) => {
    chai
      .request(server)
      .post("/api/login")
      .send({ emailAddress: "j.doe@avans.nl", password: "Secret12" })
      .end((err, res) => {
        const wrongToken = res.body.data.token;

        chai
          .request(server)
          .put("/api/meal/1")
          .set("authorization", "Bearer " + wrongToken)
          .send({
            name: "Meal",
            description: "Another delicious meal",
            price: 10,
            dateTime: "2050-01-30 18:00",
            maxAmountOfParticipants: 5,
            imageUrl: "www.google.com",
          })
          .end((err, res) => {
            res.body.should.has.property("status").to.be.equal(403);
            res.body.should.has
              .property("message")
              .to.be.equal("You do not own this data");
            res.body.should.has.property("data").to.be.empty;
            done();
          });
      });
  });
  it("TC-302-4 should not update when meal does not exist", (done) => {
    chai
      .request(server)
      .put("/api/meal/2")
      .set("authorization", "Bearer " + token)
      .send({
        name: "Meal",
        description: "Another delicious meal",
        price: 10,
        dateTime: "2050-01-30 18:00",
        maxAmountOfParticipants: 5,
        imageUrl: "www.google.com",
      })
      .end((err, res) => {
        res.body.should.has.property("status").to.be.equal(404);
        res.body.should.has
          .property("message")
          .to.be.equal("Meal with id 2 not found.");
        res.body.should.has.property("data").to.be.empty;
        done();
      });
  });
  it("TC-302-5 should have succesfully updated the meal", (done) => {
    chai
      .request(server)
      .put("/api/meal/1")
      .set("authorization", "Bearer " + token)
      .send({
        name: "Meal",
        description: "Another delicious meal",
        price: 10,
        dateTime: "2050-01-30 18:00",
        maxAmountOfParticipants: 5,
        imageUrl: "www.google.com",
      })
      .end((err, res) => {
        res.body.should.has.property("status").to.be.equal(200);
        res.body.should.has
          .property("message")
          .to.be.equal("Updated meal with id 1.");
        res.body.should.has.property("data").to.contain({
          name: "Meal",
          description: "Another delicious meal",
          price: 10,
          dateTime: "2050-01-30 18:00",
          maxAmountOfParticipants: 5,
          imageUrl: "www.google.com",
        });
        done();
      });
  });
});
describe("UC-303 Retrieving all meals", () => {
  beforeEach((done) => {
    pool.query(INSERT_USER + INSERT_TWO_MEALS, (err, result) => {
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

  it("TC-303-1 should return a list of all meals", (done) => {
    chai
      .request(server)
      .get("/api/meal")
      .set("authorization", "Bearer " + token)
      .end((err, res) => {
        res.body.should.have.property("status").to.be.equal(200);
        res.body.should.have.property("message").to.be.equal("Meals found.");
        res.body.should.have
          .property("data")
          .to.be.an("array")
          .with.lengthOf.at.least(2);
        res.body.data[0].should.have.property("cook").to.be.an("object").to.not
          .be.empty;
        done();
      });
  });
});
describe("UC-304 Retrieving meal by ID", () => {
  beforeEach((done) => {
    pool.query(INSERT_USER + INSERT_MEAL, (err, result) => {
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

  it("TC-304-1 should return an error if meal does not exist", (done) => {
    chai
      .request(server)
      .get("/api/meal/2")
      .set("authorization", "Bearer " + token)
      .end((err, res) => {
        res.body.should.has.property("status").to.be.equal(404);
        res.body.should.has
          .property("message")
          .to.be.equal("Meal with id 2 not found.");
        res.body.should.has.property("data").to.be.empty;
        done();
      });
  });
  it("TC-304-2 should succesfully return the meal details", (done) => {
    chai
      .request(server)
      .get("/api/meal/1")
      .set("authorization", "Bearer " + token)
      .end((err, res) => {
        res.body.should.has.property("status").to.be.equal(200);
        res.body.should.has
          .property("message")
          .to.be.equal("Meal with id 1 found.");
        res.body.should.has.property("data").to.contain({
          id: 1,
          name: "Meal",
          description: "A delicious meal",
          isActive: true,
          isVega: false,
          isVegan: false,
          isToTakeHome: true,
          maxAmountOfParticipants: 1,
          imageUrl: "www.google.com",
        });
        res.body.data.should.have.property("dateTime").to.be.a("string").to.not
          .be.empty;
        res.body.data.should.have.property("cook").to.be.an("object").to.not.be
          .empty;
        res.body.data.should.have.property("allergenes").to.be.an("array").to.be
          .empty;
        done();
      });
  });
});
describe("UC-305 Deleting a meal", () => {
  let token;

  beforeEach((done) => {
    pool.query(INSERT_TWO_USERS + INSERT_MEAL, (err, result) => {
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

  it("TC-305-1 should require the user to be logged in", (done) => {
    chai
      .request(server)
      .delete("/api/meal/1")
      .end((err, res) => {
        res.body.should.has.property("status").to.be.equal(401);
        res.body.should.has.property("message").to.be.equal("Not authorized");
        res.body.should.has.property("data").to.be.empty;
        done();
      });
  });
  it("TC-305-2 should require the user to be the owner of the meal", (done) => {
    chai
      .request(server)
      .post("/api/login")
      .send({ emailAddress: "j.doe@avans.nl", password: "Secret12" })
      .end((err, res) => {
        const wrongToken = res.body.data.token;

        chai
          .request(server)
          .delete("/api/meal/1")
          .set("authorization", "Bearer " + wrongToken)
          .end((err, res) => {
            res.body.should.has.property("status").to.be.equal(403);
            res.body.should.has
              .property("message")
              .to.be.equal("You do not own this data");
            res.body.should.has.property("data").to.be.empty;
            done();
          });
      });
  });
  it("TC-305-3 should not update when meal does not exist", (done) => {
    chai
      .request(server)
      .delete("/api/meal/2")
      .set("authorization", "Bearer " + token)
      .end((err, res) => {
        res.body.should.has.property("status").to.be.equal(404);
        res.body.should.has
          .property("message")
          .to.be.equal("Meal with id 2 not found.");
        res.body.should.has.property("data").to.be.empty;
        done();
      });
  });
  it("TC-305-4 should have succesfully deleted the meal", (done) => {
    chai
      .request(server)
      .delete("/api/meal/1")
      .set("authorization", "Bearer " + token)
      .end((err, res) => {
        res.body.should.has.property("status").to.be.equal(200);
        res.body.should.has
          .property("message")
          .to.be.equal("Deleted meal with id 1.");
        res.body.should.has.property("data").to.be.empty;
        done();
      });
  });
});
describe("UC-401 Registering for a meal", () => {
  let token;

  beforeEach((done) => {
    pool.query(INSERT_USER + INSERT_MEAL, (err, result) => {
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

  it("TC-401-1 should require the user to be logged in", (done) => {
    chai
      .request(server)
      .post("/api/meal/1/participate")
      .end((err, res) => {
        res.body.should.has.property("status").to.be.equal(401);
        res.body.should.has.property("message").to.be.equal("Not authorized");
        res.body.should.has.property("data").to.be.empty;
        done();
      });
  });
  it("TC-401-2 should not let the user participate when meal does not exist", (done) => {
    chai
      .request(server)
      .post("/api/meal/2/participate")
      .set("authorization", "Bearer " + token)
      .end((err, res) => {
        res.body.should.has.property("status").to.be.equal(404);
        res.body.should.has
          .property("message")
          .to.be.equal("Meal with id 2 not found.");
        res.body.should.has.property("data").to.be.empty;
        done();
      });
  });
  it("TC-401-3 should let user participate", (done) => {
    chai
      .request(server)
      .post("/api/meal/1/participate")
      .set("authorization", "Bearer " + token)
      .end((err, res) => {
        res.body.should.has.property("status").to.be.equal(200);
        res.body.should.has
          .property("message")
          .to.be.equal("User with id 1 registered for meal with id 1");
        res.body.should.has.property("data").to.be.empty;
        done();
      });
  });
  it("TC-401-4 should not let user participate when max amount of participants is reached", (done) => {
    chai
      .request(server)
      .post("/api/meal/1/participate")
      .set("authorization", "Bearer " + token)
      .end((err, res) => {
        chai
          .request(server)
          .post("/api/meal/1/participate")
          .set("authorization", "Bearer " + token)
          .end((err, res) => {
            res.body.should.has.property("status").to.be.equal(200);
            res.body.should.has
              .property("message")
              .to.be.equal("Max amount of participants reached");
            res.body.should.has.property("data").to.be.empty;
            done();
          });
      });
  });
});
describe("UC-402 Cancelling participation for a meal", () => {
  let token;

  beforeEach((done) => {
    pool.query(
      INSERT_USER + INSERT_TWO_MEALS + INSERT_PARTICIPATION,
      (err, result) => {
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
      }
    );
  });

  it("TC-402-1 should require the user to be logged in", (done) => {
    chai
      .request(server)
      .delete("/api/meal/1/participate")
      .end((err, res) => {
        res.body.should.has.property("status").to.be.equal(401);
        res.body.should.has.property("message").to.be.equal("Not authorized");
        res.body.should.has.property("data").to.be.empty;
        done();
      });
  });
  it("TC-402-2 should not let the user participate when meal does not exist", (done) => {
    chai
      .request(server)
      .delete("/api/meal/3/participate")
      .set("authorization", "Bearer " + token)
      .end((err, res) => {
        res.body.should.has.property("status").to.be.equal(404);
        res.body.should.has
          .property("message")
          .to.be.equal("Meal with id 3 not found.");
        res.body.should.has.property("data").to.be.empty;
        done();
      });
  });
  it("TC-402-3 should not let user cancel participation when participation does not exist", (done) => {
    chai
      .request(server)
      .delete("/api/meal/2/participate")
      .set("authorization", "Bearer " + token)
      .end((err, res) => {
        res.body.should.has.property("status").to.be.equal(404);
        res.body.should.has
          .property("message")
          .to.be.equal(
            "User with id 1 does not have a participation for meal with id 2."
          );
        res.body.should.has.property("data").to.be.empty;
        done();
      });
  });
  it("TC-402-4 should let user cancel participation", (done) => {
    chai
      .request(server)
      .delete("/api/meal/1/participate")
      .set("authorization", "Bearer " + token)
      .end((err, res) => {
        res.body.should.has.property("status").to.be.equal(200);
        res.body.should.has
          .property("message")
          .to.be.equal("User with id 1 unsubscribed from meal with id 1");
        res.body.should.has.property("data").to.be.empty;
        done();
      });
  });
});
