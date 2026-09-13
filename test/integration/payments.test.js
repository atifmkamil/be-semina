const chai = require("chai");
const chaiHttp = require("chai-http");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const app = require("../../app");
const Payment = require("../../app/api/v1/payments/model"); // Adjust path to Payment model
const Image = require("../../app/api/v1/images/model"); // Adjust path to Image model
const { signinUser } = require("./auth.test");

const { expect } = chai;
chai.use(chaiHttp);

describe("Payments Integration API", function () {
  this.timeout(10000);

  let token;
  let organizerId;
  let sampleImageId;

  // 1. Authenticate and prepare reusable IDs
  before(async function () {
    const res = await signinUser();
    expect(res).to.have.status(201);

    token = res.body.data.token;

    const decoded = jwt.decode(token);
    organizerId = decoded.organizer || decoded.userId;
  });

  // 2. Clear collections and seed a dummy image reference before each test
  beforeEach(async () => {
    if (mongoose.connection.readyState === 1) {
      await Payment.deleteMany({});
      await Image.deleteMany({});

      // Seed a dummy image to use in payment payload/references
      const dummyImage = await Image.create({
        name: "uploads/bank-transfer.png",
      });
      sampleImageId = dummyImage._id;
    }
  });

  // 3. Close database connection after all tests complete
  after(async function () {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  // --- GET ALL PAYMENTS (index) ---
  describe("GET /api/v1/cms/payments", () => {
    it("should return all payments for the organizer and status 200 OK", async () => {
      await Payment.create([
        { type: "Bank Transfer", image: sampleImageId, organizer: organizerId },
        { type: "E-Wallet", image: sampleImageId, organizer: organizerId },
      ]);

      const res = await chai
        .request(app)
        .get("/api/v1/cms/payments")
        .set("Authorization", `Bearer ${token}`);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property("data").that.is.an("array");
      expect(res.body.data.length).to.equal(2);
    });
  });

  // --- CREATE PAYMENT (create) ---
  describe("POST /api/v1/cms/payments", () => {
    it("should create a new payment method with image reference and return status 201 CREATED", async () => {
      const payload = {
        type: "Credit Card",
        image: sampleImageId,
      };

      const res = await chai
        .request(app)
        .post("/api/v1/cms/payments")
        .set("Authorization", `Bearer ${token}`)
        .send(payload);

      expect(res).to.have.status(201);
      expect(res.body).to.have.property("data");
      expect(res.body.data).to.have.property("type").eql("Credit Card");

      // Direct MongoDB check
      const createdPayment = await Payment.findOne({ type: "Credit Card" });
      expect(createdPayment).to.not.be.null;
      expect(createdPayment.image.toString()).to.equal(
        sampleImageId.toString(),
      );
      expect(createdPayment.organizer.toString()).to.equal(
        organizerId.toString(),
      );
    });
  });

  // --- GET PAYMENT BY ID (find) ---
  describe("GET /api/v1/cms/payments/:id", () => {
    it("should return payment details by ID and status 200 OK", async () => {
      const inserted = await Payment.create({
        type: "QRIS",
        image: sampleImageId,
        organizer: organizerId,
      });

      const res = await chai
        .request(app)
        .get(`/api/v1/cms/payments/${inserted._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property("data");
      expect(res.body.data.type).to.equal("QRIS");
    });
  });

  // --- UPDATE PAYMENT (update) ---
  describe("PUT /api/v1/cms/payments/:id", () => {
    it("should update an existing payment type/image and return status 200 OK", async () => {
      const inserted = await Payment.create({
        type: "Old Payment Type",
        image: sampleImageId,
        organizer: organizerId,
      });

      const res = await chai
        .request(app)
        .put(`/api/v1/cms/payments/${inserted._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          type: "Updated Payment Type",
          image: sampleImageId,
        });

      expect(res).to.have.status(200);
      expect(res.body.data.type).to.equal("Updated Payment Type");
    });
  });

  // --- DELETE PAYMENT (destroy) ---
  describe("DELETE /api/v1/cms/payments/:id", () => {
    it("should delete a payment from database and return status 200 OK", async () => {
      const inserted = await Payment.create({
        type: "Temporary Payment",
        image: sampleImageId,
        organizer: organizerId,
      });

      const res = await chai
        .request(app)
        .delete(`/api/v1/cms/payments/${inserted._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res).to.have.status(200);

      // Verify removal from DB
      const deletedItem = await Payment.findById(inserted._id);
      expect(deletedItem).to.be.null;
    });
  });
});
