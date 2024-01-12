"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processReceiptUploadController = exports.fetchCouponList = void 0;
const fs_1 = __importDefault(require("fs"));
const express_1 = __importDefault(require("express"));
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const server_1 = require("../server");
const processReceiptText_1 = require("../utils/processReceiptText");
const server_2 = require("../server");
// import { fetchMatchingItemNumbersFromCouponList } from '../utils/fetchMatchingItemNumbersFromCouponList'
const router = express_1.default.Router();
// Environment variable extraction for Google Cloud Document AI
const projectId = process.env.DOCAI_PROJECTID;
const fblocation = process.env.DOCAI_LOCATION;
const processorId = process.env.DOCAI_PROCESSORID;
const fetchCouponList = (path) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Attempt to get a snapshot of the collection at the given path
        const querySnapshot = yield server_1.db.collection(path).get();
        // Map through each document in the collection snapshot
        return querySnapshot.docs.map(doc => (Object.assign({ 
            // Extract the document ID
            id: doc.id }, doc.data())));
    }
    catch (error) {
        // Log any errors encountered during the fetch operation
        console.error(`Error fetching data from ${path}:`, error);
        // Re-throw the error for further handling
        throw error;
    }
});
exports.fetchCouponList = fetchCouponList;
const processReceiptUploadController = (file, uid, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        // Document AI processing
        const filePath = file.path;
        let fileBuffer;
        try {
            fileBuffer = fs_1.default.readFileSync(filePath);
        }
        catch (error) {
            return res.status(500).json({ message: "Error reading file" });
        }
        const encodedImage = fileBuffer.toString("base64");
        // Create the request for Document AI processing
        const request = {
            name: `projects/${projectId}/locations/${fblocation}/processors/${processorId}`,
            rawDocument: {
                content: encodedImage,
                mimeType: file.mimetype,
            },
        };
        // Recognizes text entities in the image
        let result, document;
        try {
            [result] = yield server_2.documentAIclient.processDocument(request);
            document = result.document;
        }
        catch (error) {
            return res.status(500).json({ message: "Error processing document" });
        }
        if (!document || !('text' in document) || document.text === "") {
            return res.status(400).json({ message: "No text extracted from document" });
        }
        // Provide a default empty string if text is null/undefined
        let text = document.text || "";
        if (text == "") {
            return res.status(400).json({ message: "No text extracted from document" });
        }
        // Delete the file from the filesystem on the server
        fs_1.default.unlinkSync(filePath);
        // Process the extracted text and return receipt data, plus text after processing
        const { updatedText, receipt, multiplierLines, couponAmounts, dollarAmounts, numberOfItemsOnReceipt } = (0, processReceiptText_1.processReceiptText)(text, uid);
        const reqUserID = uid;
        if (uid != process.env.DEMO_ACCT_UID) {
            // normally !=, == for testing as demo user
            // User is not demo user, so upload to firestore
            // Path in Firestore where the receipt will be stored
            const addToFirestorePath = `receipts`;
            // Creating a reference to a new document in Firestore
            const docRef = firebase_admin_1.default.firestore().collection(addToFirestorePath).doc();
            // Extracting the document ID for future reference
            const docId = docRef.id;
            try {
                // Upload the receipt data to Firestore
                yield docRef.set(Object.assign({}, receipt));
            }
            catch (error) {
                return res.status(500).json({ message: "Error saving receipt to Firestore" });
            }
            // Process the item lines (extracted from the receipt)
            const { updatedItemLines: itemLines } = (0, processReceiptText_1.processReceiptItemLines)(uid, updatedText, docId, multiplierLines, couponAmounts, dollarAmounts, numberOfItemsOnReceipt);
            // only the receipt is uploaded to firestore at this point    
            // Initialize a batch operation in Firestore
            const batch = firebase_admin_1.default.firestore().batch();
            // Define the path in Firestore for storing item lines
            const itemLinesCollectionPath = `itemLines`;
            try {
                // Iterate over each item line
                itemLines.forEach(item => {
                    // Create a reference for each item line in Firestore
                    const itemDocRef = firebase_admin_1.default.firestore().collection(itemLinesCollectionPath).doc();
                    // Add each item line to the batch operation
                    batch.set(itemDocRef, item);
                });
                // Commit the batch operation to Firestore, saving all item lines at once
                yield batch.commit();
            }
            catch (error) {
                return res.status(500).json({ message: "Error saving item lines to Firestore" });
            }
            res.status(200).json({ message: "Receipts processed successfully" });
        }
        else {
            // User is demo user, so don't upload to Firestore, just send back the receipt and item lines
            const { updatedItemLines: itemLines } = (0, processReceiptText_1.processReceiptItemLines)(uid, updatedText, 'demoReceiptId', multiplierLines, couponAmounts, dollarAmounts, numberOfItemsOnReceipt);
            return res.status(200).json({ receipt, itemLines });
        }
    }
    catch (error) {
        res.status(500).json({ message: "An error occurred during processing" });
    }
});
exports.processReceiptUploadController = processReceiptUploadController;
