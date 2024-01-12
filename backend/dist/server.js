"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = exports.documentAIclient = exports.firestore = exports.db = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Firebase and google cloud imports
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const documentai_1 = require("@google-cloud/documentai");
const firestore_1 = require("firebase-admin/firestore");
const multer_1 = __importDefault(require("multer"));
const cors_1 = __importDefault(require("cors"));
const fs_1 = __importDefault(require("fs"));
// Routes
const uploadRoutes_1 = __importDefault(require("./routes/uploadRoutes"));
const webhookRoutes_1 = __importDefault(require("./routes/webhookRoutes"));
const createCheckoutSessionRoutes_1 = __importDefault(require("./routes/createCheckoutSessionRoutes"));
// Google Cloud Document AI and Storage client instantiation
// Initialize Firebase Admin SDK
const serviceAccount = JSON.parse(fs_1.default.readFileSync("couponcatch-e211e-firebase-admin.json", "utf8"));
firebase_admin_1.default.initializeApp({
    credential: firebase_admin_1.default.credential.cert(serviceAccount),
});
exports.db = firebase_admin_1.default.firestore();
const projectId = process.env.PROJECT_ID;
// Initialize Firestore
exports.firestore = new firestore_1.Firestore({
    projectId: projectId, // Replace with your project ID
});
// Google Cloud Document AI client instantiation
exports.documentAIclient = new documentai_1.DocumentProcessorServiceClient({
    credential: firebase_admin_1.default.credential.cert(serviceAccount),
});
// Stripe initialization with TypeScript assertion for non-null environment variable
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// Middleware setup
app.use((0, cors_1.default)({ origin: "http://localhost:8100" }));
app.use(express_1.default.json());
app.use(express_1.default.static("public"));
// Multer storage configuration
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        const dir = 'uploads/';
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        // Append user UID to the file name
        const userUid = req.headers["x-user-uid"];
        cb(null, `Someavalue-${Date.now()}.${file.mimetype.split("/")[1]}`);
    },
});
// Multer upload configuration
exports.upload = (0, multer_1.default)({ storage });
// Routes
app.post("/upload", exports.upload.single("image"), uploadRoutes_1.default);
app.post("/create-checkout-session", createCheckoutSessionRoutes_1.default);
app.post("/webhook", webhookRoutes_1.default);
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
