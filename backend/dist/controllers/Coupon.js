"use strict";
// couponController.js
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
const { firestore } = require('firebase-admin');
const db = firestore();
// Fetch all coupons
exports.getAllCoupons = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const couponCollection = db.collection('coupons');
        const snapshot = yield couponCollection.get();
        if (snapshot.empty) {
            return res.status(404).json({ message: 'No coupons found' });
        }
        const coupons = snapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        res.status(200).json(coupons);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Get a single coupon by item number
exports.getCouponByItemNumber = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { itemNumber } = req.params;
        const couponCollection = db.collection('coupons');
        const snapshot = yield couponCollection.where('itemNumber', '==', parseInt(itemNumber)).get();
        if (snapshot.empty) {
            return res.status(404).json({ message: 'Coupon not found' });
        }
        const coupon = snapshot.docs[0].data();
        res.status(200).json(Object.assign({ id: snapshot.docs[0].id }, coupon));
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Add a new coupon
exports.addCoupon = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newCoupon = req.body;
        const result = yield db.collection('coupons').add(newCoupon);
        res.status(201).json(Object.assign({ id: result.id }, newCoupon));
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Update an existing coupon
exports.updateCoupon = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { itemNumber } = req.params;
        const couponUpdate = req.body;
        const couponCollection = db.collection('coupons');
        const snapshot = yield couponCollection.where('itemNumber', '==', parseInt(itemNumber)).get();
        if (snapshot.empty) {
            return res.status(404).json({ message: 'Coupon not found' });
        }
        const docId = snapshot.docs[0].id;
        yield couponCollection.doc(docId).update(couponUpdate);
        res.status(200).json(Object.assign({ id: docId }, couponUpdate));
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Delete a coupon
exports.deleteCoupon = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { itemNumber } = req.params;
        const couponCollection = db.collection('coupons');
        const snapshot = yield couponCollection.where('itemNumber', '==', parseInt(itemNumber)).get();
        if (snapshot.empty) {
            return res.status(404).json({ message: 'Coupon not found' });
        }
        const docId = snapshot.docs[0].id;
        yield couponCollection.doc(docId).delete();
        res.status(200).json({ message: 'Coupon deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
