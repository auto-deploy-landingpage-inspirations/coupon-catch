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
exports.getCouponByItemNumber = exports.saveCoupon = void 0;
const firebase_admin_1 = require("firebase-admin");
// Firestore collection name
const collectionName = 'coupons';
// Function to save a coupon to Firestore
const saveCoupon = (couponData) => __awaiter(void 0, void 0, void 0, function* () {
    const db = (0, firebase_admin_1.firestore)();
    yield db.collection(collectionName).add(couponData);
});
exports.saveCoupon = saveCoupon;
// Function to get a coupon by item number
const getCouponByItemNumber = (itemNumber) => __awaiter(void 0, void 0, void 0, function* () {
    const db = (0, firebase_admin_1.firestore)();
    const snapshot = yield db.collection(collectionName)
        .where('itemNumber', '==', itemNumber)
        .get();
    if (snapshot.empty) {
        return undefined;
    }
    return snapshot.docs[0].data();
});
exports.getCouponByItemNumber = getCouponByItemNumber;
// Other functions as needed for your business logic
// e.g., updateCoupon, deleteCoupon, etc.
