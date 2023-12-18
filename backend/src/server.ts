import express from "express";
import dotenv from "dotenv";
dotenv.config();

// Firebase and google cloud imports
import admin from "firebase-admin";
import { DocumentProcessorServiceClient } from "@google-cloud/documentai";
import { Firestore } from "firebase-admin/firestore";

import multer from "multer";
import cors from "cors";
import fs from "fs";

// Routes
import uploadRoutes from "./routes/uploadRoutes";
import webhookRoutes from "./routes/webhookRoutes";
import createCheckoutSessionRoutes from "./routes/createCheckoutSessionRoutes";
// Google Cloud Document AI and Storage client instantiation

// Initialize Firebase Admin SDK
const serviceAccount = JSON.parse(
  fs.readFileSync("couponcatch-e211e-firebase-admin.json", "utf8")
  );
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  
  export const db = admin.firestore();

const projectId = process.env.PROJECT_ID;

// Initialize Firestore
export const firestore = new Firestore({
  projectId: projectId, // Replace with your project ID
});

// Google Cloud Document AI client instantiation
export const documentAIclient = new DocumentProcessorServiceClient({
  credential: admin.credential.cert(serviceAccount),
});

// Stripe initialization with TypeScript assertion for non-null environment variable
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY as string);

const app = express();
const port = process.env.PORT || 3000;

// Middleware setup
app.use(cors({ origin: "http://localhost:8100" }));
app.use(express.json());
app.use(express.static("public"));


// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    // Append user UID to the file name
    const userUid = req.headers["x-user-uid"] as string;
    cb(null, `Someavalue-${Date.now()}.${file.mimetype.split("/")[1]}`);
  },
});

// Multer upload configuration
export const upload = multer({ storage });

// Routes
app.post("/upload", upload.single("image"), uploadRoutes);
app.post("/create-checkout-session", createCheckoutSessionRoutes);
app.post("/webhook", webhookRoutes);


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
