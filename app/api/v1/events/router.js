const express = require("express");
const router = express();

const {
  authenticateUser,
  authorizeRoles,
} = require("../../../middlewares/auth");

const {
  create,
  index,
  find,
  destroy,
  update,
  changeStatus,
} = require("./controller");

router.post("/events", authenticateUser, authorizeRoles("organizer"), create);
router.get("/events", authenticateUser, authorizeRoles("organizer"), index);
router.get("/events/:id", authenticateUser, authorizeRoles("organizer"), find);
router.put(
  "/events/:id",
  authenticateUser,
  authorizeRoles("organizer"),
  update,
);
router.put(
  "/events/:id/status",
  authenticateUser,
  authorizeRoles("organizer"),
  changeStatus,
);
router.delete(
  "/events/:id",
  authenticateUser,
  authorizeRoles("organizer"),
  destroy,
);

module.exports = router;
