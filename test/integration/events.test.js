const chai = require("chai");
const chaiHttp = require("chai-http");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const app = require("../../app");

// Models
const Event = require("../../app/api/v1/events/model");
const Category = require("../../app/api/v1/categories/model");
const Image = require("../../app/api/v1/images/model");
const Talent = require("../../app/api/v1/talents/model");

const { signinUser } = require("./auth.test");

const { expect } = chai;
chai.use(chaiHttp);

describe("Events Integration API", function () {
  this.timeout(10000);

  let token;
  let organizerId;

  // Foreign keys seeded for event payload testing
  let sampleCategoryId;
  let sampleImageId;
  let sampleTalentId;

  // 1. Authenticate and retrieve token & organizerId
  before(async function () {
    const res = await signinUser();
    expect(res).to.have.status(201);

    token = res.body.data.token;

    const decoded = jwt.decode(token);
    organizerId = decoded.organizer || decoded.userId;
  });

  // 2. Wipe database & seed prerequisite models (Category, Image, Talent) before each test
  beforeEach(async () => {
    if (mongoose.connection.readyState === 1) {
      await Event.deleteMany({});
      await Category.deleteMany({});
      await Image.deleteMany({});
      await Talent.deleteMany({});

      // Seed Category
      const dummyCategory = await Category.create({
        name: "Technology",
        organizer: organizerId,
      });
      sampleCategoryId = dummyCategory._id;

      // Seed Image
      const dummyImage = await Image.create({
        name: "uploads/event-poster.png",
      });
      sampleImageId = dummyImage._id;

      // Seed Talent
      const dummyTalent = await Talent.create({
        name: "John Doe",
        role: "Speaker",
        organizer: organizerId,
        image: sampleImageId,
      });
      sampleTalentId = dummyTalent._id;
    }
  });

  // 3. Clean up DB connection
  after(async function () {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  // Helper for creating valid Event document
  const createSampleEventPayload = (overrides = {}) => ({
    title: "Tech Conference 2026",
    date: new Date("2026-10-15"),
    about: "Annual developer and tech event.",
    tagline: "Build the Future",
    keyPoint: ["AI", "Web3", "Cloud"],
    venueName: "Convention Center Hall A",
    statusEvent: "Draft",
    tickets: [
      {
        type: "VIP",
        price: 500000,
        stock: 50,
        statusTicketCategories: true,
        expired: new Date("2026-10-01"),
      },
      {
        type: "Regular",
        price: 150000,
        stock: 200,
        statusTicketCategories: true,
        expired: new Date("2026-10-01"),
      },
    ],
    category: sampleCategoryId,
    image: sampleImageId,
    talent: sampleTalentId,
    organizer: organizerId,
    ...overrides,
  });

  // --- GET ALL EVENTS (index) ---
  describe("GET /api/v1/cms/events", () => {
    it("should return all events and status 200 OK", async () => {
      await Event.create([
        createSampleEventPayload({ title: "Event One" }),
        createSampleEventPayload({ title: "Event Two" }),
      ]);

      const res = await chai
        .request(app)
        .get("/api/v1/cms/events")
        .set("Authorization", `Bearer ${token}`);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property("data").that.is.an("array");
      expect(res.body.data.length).to.equal(2);
    });
  });

  // --- CREATE EVENT (create) ---
  describe("POST /api/v1/cms/events", () => {
    it("should create a new event and return status 201 CREATED", async () => {
      const payload = {
        title: "Node.js Summit",
        date: "2026-11-20",
        about: "Deep dive into Node.js runtime",
        tagline: "Fast & Scalable",
        keyPoint: ["Performance", "Architecture"],
        venueName: "Tech Hub Building",
        statusEvent: "Draft",
        tickets: [
          {
            type: "Early Bird",
            price: 100000,
            stock: 100,
            statusTicketCategories: true,
            expired: "2026-11-01",
          },
        ],
        category: sampleCategoryId,
        image: sampleImageId,
        talent: sampleTalentId,
      };

      const res = await chai
        .request(app)
        .post("/api/v1/cms/events")
        .set("Authorization", `Bearer ${token}`)
        .send(payload);

      expect(res).to.have.status(201);
      expect(res.body).to.have.property("data");
      expect(res.body.data).to.have.property("title").eql("Node.js Summit");

      // Direct MongoDB check
      const createdEvent = await Event.findOne({ title: "Node.js Summit" });
      expect(createdEvent).to.not.be.null;
      expect(createdEvent.organizer.toString()).to.equal(
        organizerId.toString(),
      );
      expect(createdEvent.tickets.length).to.equal(1);
    });
  });

  // --- GET EVENT BY ID (find) ---
  describe("GET /api/v1/cms/events/:id", () => {
    it("should return event details by ID and status 200 OK", async () => {
      const inserted = await Event.create(
        createSampleEventPayload({ title: "Vue Summit" }),
      );

      const res = await chai
        .request(app)
        .get(`/api/v1/cms/events/${inserted._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property("data");
      expect(res.body.data.title).to.equal("Vue Summit");
    });
  });

  // --- UPDATE EVENT (update) ---
  describe("PUT /api/v1/cms/events/:id", () => {
    it("should update an existing event details and return status 200 OK", async () => {
      const inserted = await Event.create(
        createSampleEventPayload({ title: "Old Title" }),
      );

      const updatePayload = {
        title: "Updated Title",
        date: "2026-12-01",
        about: "Updated About Description",
        tagline: "Updated Tagline",
        keyPoint: ["Updated"],
        venueName: "Main Arena",
        tickets: [
          {
            type: "General Admission",
            price: 200000,
            stock: 300,
            statusTicketCategories: true,
          },
        ],
        category: sampleCategoryId,
        image: sampleImageId,
        talent: sampleTalentId,
      };

      const res = await chai
        .request(app)
        .put(`/api/v1/cms/events/${inserted._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send(updatePayload);

      expect(res).to.have.status(200);
      expect(res.body.data.title).to.equal("Updated Title");
    });
  });

  // --- CHANGE EVENT STATUS (changeStatus) ---
  describe("PUT /api/v1/cms/events/:id/status", () => {
    it("should update event status from Draft to Published and return status 200 OK", async () => {
      const inserted = await Event.create(
        createSampleEventPayload({ statusEvent: "Draft" }),
      );

      const res = await chai
        .request(app)
        .put(`/api/v1/cms/events/${inserted._id}/status`)
        .set("Authorization", `Bearer ${token}`)
        .send({ statusEvent: "Published" });

      expect(res).to.have.status(200);
      expect(res.body.data.statusEvent).to.equal("Published");

      // Direct DB verification
      const updatedInDb = await Event.findById(inserted._id);
      expect(updatedInDb.statusEvent).to.equal("Published");
    });
  });

  // --- DELETE EVENT (destroy) ---
  describe("DELETE /api/v1/cms/events/:id", () => {
    it("should delete an event from database and return status 200 OK", async () => {
      const inserted = await Event.create(
        createSampleEventPayload({ title: "Event to Delete" }),
      );

      const res = await chai
        .request(app)
        .delete(`/api/v1/cms/events/${inserted._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res).to.have.status(200);

      // Verify removal from DB
      const deletedItem = await Event.findById(inserted._id);
      expect(deletedItem).to.be.null;
    });
  });
});
