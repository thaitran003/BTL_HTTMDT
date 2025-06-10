import express from "express";
import { isLoggedIn } from "../middlewares/isLoggedIn.js";

import { paymentQrCtrl } from "../controllers/paymentCtrl.js";

const paymentRoute = express.Router();

paymentRoute.post("/qr", paymentQrCtrl);

export default paymentRoute;
