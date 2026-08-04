import { Router } from "express";
import { createCheckoutSession, handleWebhook } from "../controllers/payment.controller";
import express from "express";

const router = Router();

// Create checkout session (Needs auth in real app)
router.post("/create-checkout-session", createCheckoutSession);

// Stripe Webhook (Needs raw body, so we use express.raw before express.json parsing in app.ts, 
// or define this route before the global express.json in app.ts)
router.post("/webhook", express.raw({ type: "application/json" }), handleWebhook);

export default router;
