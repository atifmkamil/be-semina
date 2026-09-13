const chai = require("chai");
const chaiHttp = require("chai-http");
const mongoose = require("mongoose");
const app = require("../../app");

const { expect } = chai;
chai.use(chaiHttp);

// Reusable sign-in helper accepting optional custom payload
const signinUser = async (customPayload = {}) => {
  const dbUrl =
    process.env.URL_MONGODB_DEV || "mongodb://127.0.0.1:27017/db_semina";

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(dbUrl);
  }

  // Merge default valid credentials with any custom test inputs
  const payload = {
    email: "organizer@gmail.com",
    password: "rahasia",
    ...customPayload,
  };

  return await chai.request(app).post("/api/v1/cms/signin").send(payload);
};

// --- AUTHENTICATION SUITE ---
describe("signinCms Controller (Integration Test)", function () {
  this.timeout(10000);

  // 1. Success Test Case
  it("should return 201 CREATED and token on valid credentials", async () => {
    const res = await signinUser(); // Uses default valid credentials

    expect(res).to.have.status(201);
    expect(res.body).to.have.property("data");
    expect(res.body.data).to.have.property("token");
  });

  // 2. Error Test Case: Incorrect Password
  it("should return error status on wrong password", async () => {
    const res = await signinUser({ password: "wrongpassword" });

    expect(res.status).to.not.equal(201);
    expect(res.body).to.have.property("msg");
  });

  // 3. Error Test Case: Non-existent Email
  it("should return error status on invalid email", async () => {
    const res = await signinUser({ email: "notfound@gmail.com" });

    expect(res.status).to.not.equal(201);
    expect(res.body).to.have.property("msg");
  });

  // 4. Error Test Case: Missing Password Field
  it("should return error status when password is missing", async () => {
    const res = await signinUser({ password: "" });

    expect(res.status).to.not.equal(201);
  });
});

module.exports = { signinUser };
