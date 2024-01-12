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
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("../server");
const handleInvoicePaymentSucceeded = (invoice) => __awaiter(void 0, void 0, void 0, function* () {
    // Extract userId from the invoice object
    const userId = invoice.customer;
    // Update Firestore
    try {
        yield server_1.firestore.doc(`users/${userId}/info/settings`).update({
            isPayingUser: true
        });
        console.log(`Updated user ${userId}: set isPayingUser to true.`);
    }
    catch (error) {
        console.error(`Error updating Firestore for user ${userId}:`, error);
    }
});
exports.default = handleInvoicePaymentSucceeded;
// Triggered When: A payment for a subscription invoice succeeds.
// Use Case: This is crucial for identifying "paying" users. A successful invoice payment typically means the user's subscription is active and in good standing. It's essential for both initial payments and recurring billing cycles.
