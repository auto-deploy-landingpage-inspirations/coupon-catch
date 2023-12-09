// couponController.js

const { firestore } = require('firebase-admin');
const db = firestore();

// Fetch all coupons
exports.getAllCoupons = async (req, res) => {
    try {
        const couponCollection = db.collection('coupons');
        const snapshot = await couponCollection.get();

        if (snapshot.empty) {
            return res.status(404).json({ message: 'No coupons found' });
        }

        const coupons = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(coupons);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a single coupon by item number
exports.getCouponByItemNumber = async (req, res) => {
    try {
        const { itemNumber } = req.params;
        const couponCollection = db.collection('coupons');
        const snapshot = await couponCollection.where('itemNumber', '==', parseInt(itemNumber)).get();

        if (snapshot.empty) {
            return res.status(404).json({ message: 'Coupon not found' });
        }

        const coupon = snapshot.docs[0].data();
        res.status(200).json({ id: snapshot.docs[0].id, ...coupon });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Add a new coupon
exports.addCoupon = async (req, res) => {
    try {
        const newCoupon = req.body;
        const result = await db.collection('coupons').add(newCoupon);
        res.status(201).json({ id: result.id, ...newCoupon });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update an existing coupon
exports.updateCoupon = async (req, res) => {
    try {
        const { itemNumber } = req.params;
        const couponUpdate = req.body;
        const couponCollection = db.collection('coupons');
        const snapshot = await couponCollection.where('itemNumber', '==', parseInt(itemNumber)).get();

        if (snapshot.empty) {
            return res.status(404).json({ message: 'Coupon not found' });
        }

        const docId = snapshot.docs[0].id;
        await couponCollection.doc(docId).update(couponUpdate);
        res.status(200).json({ id: docId, ...couponUpdate });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete a coupon
exports.deleteCoupon = async (req, res) => {
    try {
        const { itemNumber } = req.params;
        const couponCollection = db.collection('coupons');
        const snapshot = await couponCollection.where('itemNumber', '==', parseInt(itemNumber)).get();

        if (snapshot.empty) {
            return res.status(404).json({ message: 'Coupon not found' });
        }

        const docId = snapshot.docs[0].id;
        await couponCollection.doc(docId).delete();
        res.status(200).json({ message: 'Coupon deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
