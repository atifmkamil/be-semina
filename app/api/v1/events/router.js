const express = require("express");
const router = express();

const {
  create,
  index,
  find,
  destroy,
  update,
  changeStatus,
} = require("./controller");

router.post("/events", create);
router.get("/events", index);
router.get("/events/:id", find);
router.put("/events/:id", update);
router.put("/events/:id/status", changeStatus);
router.delete("/events/:id", destroy);

module.exports = router;
