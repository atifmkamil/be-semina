const chai = require("chai");
const chaiHttp = require("chai-http");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const app = require("../../app");
const Category = require("../../app/api/v1/categories/model");
const { signinUser } = require("./auth.test"); // <--- Import directly from auth.test.js

const { expect } = chai;
chai.use(chaiHttp);

describe("Categories Integration API", function () {
  this.timeout(10000);

  let token;

  // Call the exported function from auth.test.js
  before(async function () {
    const res = await signinUser();
    expect(res).to.have.status(201);
    token = res.body.data.token;

    const decoded = jwt.decode(token);
    organizerId = decoded.organizer || decoded.userId;
  });

  beforeEach(async () => {
    if (mongoose.connection.readyState === 1) {
      await Category.deleteMany({});
    }
  });

  after(async function () {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  describe("GET /api/v1/cms/categories", () => {
    it("should return all categories", async () => {
      await Category.create([
        { name: "Web Development", organizer: organizerId },
      ]);

      const res = await chai
        .request(app)
        .get("/api/v1/cms/categories")
        .set("Authorization", `Bearer ${token}`);

      expect(res).to.have.status(200);
      expect(res.body.data).to.be.an("array");
    });
  });

  describe("POST /api/v1/cms/categories", () => {
    it("should create a new category automatically linked to the logged-in organizer", async () => {
      const payload = { name: "Cloud Computing" };

      const res = await chai
        .request(app)
        .post("/api/v1/cms/categories")
        .set("Authorization", `Bearer ${token}`)
        .send(payload);

      expect(res).to.have.status(201);
      expect(res.body).to.have.property("data");
      expect(res.body.data).to.have.property("name").eql("Cloud Computing");

      // Verify directly in MongoDB
      const createdCategory = await Category.findOne({ name: "Cloud Computing" });
      expect(createdCategory).to.not.be.null;
      expect(createdCategory.organizer.toString()).to.equal(organizerId.toString());
    });
  });

  // --- GET CATEGORY BY ID ---
  describe("GET /api/v1/cms/categories/:id", () => {
    it("should return category details by ID", async () => {
      const inserted = await Category.create({ name: "DevOps", organizer: organizerId });

      const res = await chai
        .request(app)
        .get(`/api/v1/cms/categories/${inserted._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property("data");
      expect(res.body.data.name).to.equal("DevOps");
    });
  });

  // --- UPDATE CATEGORY ---
  describe("PUT /api/v1/cms/categories/:id", () => {
    it("should update an existing category name", async () => {
      const inserted = await Category.create({ name: "Old Name", organizer: organizerId });

      const res = await chai
        .request(app)
        .put(`/api/v1/cms/categories/${inserted._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Updated Name" });

      expect(res).to.have.status(200);
      expect(res.body.data.name).to.equal("Updated Name");
    });
  });

  // --- DELETE CATEGORY ---
  describe("DELETE /api/v1/cms/categories/:id", () => {
    it("should delete a category from database", async () => {
      const inserted = await Category.create({ name: "Temporary Category", organizer: organizerId });

      const res = await chai
        .request(app)
        .delete(`/api/v1/cms/categories/${inserted._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res).to.have.status(200);

      // Verify removal from DB
      const deletedItem = await Category.findById(inserted._id);
      expect(deletedItem).to.be.null;
    });
  });
});
