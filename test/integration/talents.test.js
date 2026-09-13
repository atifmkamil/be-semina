const chai = require("chai");
const chaiHttp = require("chai-http");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const app = require("../../app");
const Talent = require("../../app/api/v1/talents/model"); // Path to Talent model
const Image = require("../../app/api/v1/images/model"); // Path to Image model
const { signinUser } = require("./auth.test");

const { expect } = chai;
chai.use(chaiHttp);

describe("Talents Integration API (with Image Reference)", function () {
  this.timeout(10000);

  let token;
  let organizerId;
  let imageId;

  // 1. Authenticate, extract organizer ID, and seed a test image document
  before(async function () {
    const res = await signinUser();
    expect(res).to.have.status(201);

    token = res.body.data.token;

    const decoded = jwt.decode(token);
    organizerId = decoded.organizer || decoded.userId;

    // Ensure DB connection is established before seeding Image
    if (mongoose.connection.readyState === 1) {
      const createdImage = await Image.create({
        name: "uploads/avatar-test.jpg",
      });
      imageId = createdImage._id;
    }
  });

  // 2. Wipe Talent collection before each test for clean isolation
  beforeEach(async () => {
    if (mongoose.connection.readyState === 1) {
      await Talent.deleteMany({});
    }
  });

  // 3. Disconnect database & cleanup Image collection after all tests complete
  after(async function () {
    if (mongoose.connection.readyState !== 0) {
      await Image.deleteMany({});
      await mongoose.disconnect();
    }
  });

  // --- GET ALL TALENTS ---
  describe("GET /api/v1/cms/talents", () => {
    it("should return all talents including populated/referenced image field", async () => {
      await Talent.create([
        {
          name: "John Doe",
          role: "Speaker",
          image: imageId,
          organizer: organizerId,
        },
        {
          name: "Jane Smith",
          role: "Moderator",
          image: imageId,
          organizer: organizerId,
        },
      ]);

      const res = await chai
        .request(app)
        .get("/api/v1/cms/talents")
        .set("Authorization", `Bearer ${token}`);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property("data").that.is.an("array");
      expect(res.body.data.length).to.equal(2);
    });
  });

  // --- CREATE TALENT WITH IMAGE REFERENCE ---
  describe("POST /api/v1/cms/talents", () => {
    it("should create a talent with a valid image ID reference and return 201 CREATED", async () => {
      const payload = {
        name: "Alex Johnson",
        role: "Keynote Speaker",
        image: imageId, // <--- Passing the referenced Image ObjectId
      };

      const res = await chai
        .request(app)
        .post("/api/v1/cms/talents")
        .set("Authorization", `Bearer ${token}`)
        .send(payload);

      expect(res).to.have.status(201);
      expect(res.body).to.have.property("data");
      expect(res.body.data).to.have.property("name").eql("Alex Johnson");

      // Verify persistence directly in MongoDB
      const createdTalent = await Talent.findOne({ name: "Alex Johnson" });
      expect(createdTalent).to.not.be.null;
      expect(createdTalent.image.toString()).to.equal(imageId.toString());
      expect(createdTalent.organizer.toString()).to.equal(
        organizerId.toString(),
      );
    });
  });

  // --- GET TALENT BY ID ---
  describe("GET /api/v1/cms/talents/:id", () => {
    it("should return talent details matching ID", async () => {
      const inserted = await Talent.create({
        name: "Michael Scott",
        role: "Host",
        image: imageId,
        organizer: organizerId,
      });

      const res = await chai
        .request(app)
        .get(`/api/v1/cms/talents/${inserted._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property("data");
      expect(res.body.data.name).to.equal("Michael Scott");
    });
  });

  // --- UPDATE TALENT WITH IMAGE REFERENCE ---
  describe("PUT /api/v1/cms/talents/:id", () => {
    it("should update existing talent name, role, and image ID", async () => {
      const inserted = await Talent.create({
        name: "Dwight Schrute",
        role: "Co-Host",
        image: imageId,
        organizer: organizerId,
      });

      // Create a second image to test changing the referenced image
      const newImage = await Image.create({ name: "uploads/new-avatar.jpg" });

      const res = await chai
        .request(app)
        .put(`/api/v1/cms/talents/${inserted._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Dwight Schrute",
          role: "Lead Speaker",
          image: newImage._id, // <--- Updated image reference ID
        });

      expect(res).to.have.status(200);
      expect(res.body.data.role).to.equal("Lead Speaker");
    });
  });

  // --- DELETE TALENT ---
  describe("DELETE /api/v1/cms/talents/:id", () => {
    it("should delete a talent document from database", async () => {
      const inserted = await Talent.create({
        name: "Jim Halpert",
        role: "Panelist",
        image: imageId,
        organizer: organizerId,
      });

      const res = await chai
        .request(app)
        .delete(`/api/v1/cms/talents/${inserted._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res).to.have.status(200);

      const deletedItem = await Talent.findById(inserted._id);
      expect(deletedItem).to.be.null;
    });
  });
});
