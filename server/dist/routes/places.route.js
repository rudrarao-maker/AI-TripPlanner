"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const places_controller_1 = require("../controllers/places.controller");
const router = express_1.default.Router();
// Allow unauthenticated access for now so the frontend can easily fetch
router.get("/nearby", places_controller_1.getNearbyPlaces);
exports.default = router;
