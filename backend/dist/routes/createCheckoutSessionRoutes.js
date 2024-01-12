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
const stripe_1 = __importDefault(require("stripe"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = new stripe_1.default(stripeSecretKey, { apiVersion: '2023-10-16' });
function createCheckoutSession(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { firebaseUserId, receiptId } = req.body;
        try {
            const session = yield stripe.checkout.sessions.create({
                payment_method_types: ["card"],
                line_items: [
                    {
                        price: "price_1OImH1IpyKVPSD8GCa3dU42H",
                        quantity: 1,
                    },
                ],
                mode: "subscription",
                success_url: `http://localhost:8100/dashboard/home/receipts/${receiptId}`,
                cancel_url: `http://localhost:8100/dashboard/home/receipts/${receiptId}`,
                automatic_tax: { enabled: true },
                metadata: { fb_userId: firebaseUserId },
                subscription_data: {
                // Subscription-specific data
                },
            });
            res.json({ url: session.url });
        }
        catch (error) {
            if (error instanceof Error) {
                console.error("Error:", error.message);
                res.status(500).send(error.message);
            }
            else {
                console.error("An unexpected error occurred");
                res.status(500).send('An unexpected error occurred');
            }
        }
    });
}
exports.default = createCheckoutSession;
