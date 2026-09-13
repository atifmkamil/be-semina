const chai = require("chai");
const chaiHttp = require("chai-http");
const mongoose = require("mongoose");
const app = require("../../app");

const { expect } = chai;
chai.use(chaiHttp);

describe("Images Integration API (Public)", function () {
  this.timeout(10000);

  before(async function () {
    const dbUrl =
      process.env.URL_MONGODB_DEV || "mongodb://127.0.0.1:27017/db_semina";

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(dbUrl);
    }
  });

  after(async function () {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  describe("POST /api/v1/cms/images", () => {
    it("should upload image without path module and return 201 CREATED", async () => {
      const dummyBuffer = Buffer.from("fake-image-binary-content");

      const res = await chai
        .request(app)
        .post("/api/v1/cms/images")
        .attach("avatar", dummyBuffer, "test-image.jpg");

      expect(res).to.have.status(201);
      expect(res.body).to.have.property("data");
      expect(res.body.data).to.have.property("name");
    });

    it("should return an error when no file is attached", async () => {
      const res = await chai.request(app).post("/api/v1/cms/images");
      // No .attach() block included

      expect(res.status).to.be.oneOf([400, 422, 500]);
      expect(res.body).to.have.property("msg");
    });

    // 2. Incorrect Field Name (e.g., using 'file' or 'image' instead of 'avatar')
    it("should return an error when using an invalid form field name", async () => {
      const dummyBuffer = Buffer.from("fake-image-binary-content");

      const res = await chai
        .request(app)
        .post("/api/v1/cms/images")
        .attach("wrongFieldName", dummyBuffer, "test-image.jpg");

      expect(res.status).to.be.oneOf([400, 422, 500]);
      expect(res.body).to.have.property("msg");
    });

    // 3. Unsupported File Extension (If Multer fileFilter is configured)
    it("should return an error when uploading a non-image file type", async () => {
      const dummyBuffer = Buffer.from("fake-text-content");

      const res = await chai
        .request(app)
        .post("/api/v1/cms/images")
        .attach("avatar", dummyBuffer, "document.pdf");

      expect(res.status).to.be.oneOf([400, 422, 500]);
      expect(res.body).to.have.property("msg");
    });
  });
});
