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
const handleCustomerSubscriptionDeleted = (invoice) => __awaiter(void 0, void 0, void 0, function* () {
    // Extract userId from the invoice object
    const userId = invoice.customer;
    // Update Firestore
    try {
        yield server_1.firestore.doc(`users/${userId}/info/settings`).update({
            isPayingUser: false
        });
        console.log(`Updated user ${userId}: set isPayingUser to false.`);
    }
    catch (error) {
        console.error(`Error updating Firestore for user ${userId}:`, error);
    }
});
exports.default = handleCustomerSubscriptionDeleted;
// Triggered When: A subscription is canceled or ends.
// Use Case: Essential for identifying when a user's subscription has been canceled or has expired. This event marks a user as no longer in good standing as a paying subscriber.
