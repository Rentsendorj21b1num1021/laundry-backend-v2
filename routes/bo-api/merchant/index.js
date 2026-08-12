import express from "express";

import createHandler from "../../../controllers/bo-api/merchant/create.js";
import detailHandler from "../../../controllers/bo-api/merchant/detail.js";
import listHandler from "../../../controllers/bo-api/merchant/list.js";
import { auth, superAdminOnly } from "../../../middleware/authMiddleware.js";

const router = express.Router();

router.post("/list", auth, superAdminOnly, listHandler);
router.post("/create", auth, superAdminOnly, createHandler);
router.post("/detail", auth, superAdminOnly, detailHandler);

export default router;
