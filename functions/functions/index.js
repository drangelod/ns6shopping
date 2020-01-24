const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp(functions.config().firebase);
const stripe = require("stripe")(functions.config().stripe.token);
exports.stripeCharge = functions.firestore
    .document("/Payments/{paymentId}")
    .onCreate(async (event, context) => {
        const payment = event.data();
        const paymentId = context.params.paymentId;
        const amount = payment.amount; // amount must be in cents
        const source = payment.token;
        const currency = "usd";
        const description = "Shopping App Purchase";
        const newcharge = {
            amount,
            currency,
            description,
            source
        };
        return await stripe.charges
            .create(newcharge, {
                idempotencyKey: paymentId //used to prevent double charges for the same payment request
            })
            .then(async function(charge, err) {
                if (err) console.error("error!:", err);
                else {
                    console.log("charge:", charge);
                    return charge;
                }
            })
            .then(newcharge => {
                return admin
                    .firestore()
                    .collection("Payments")
                    .doc(paymentId)
                    .update({ charge: newcharge })
                    .then(function(res) {
                        console.log("Updated DB", res);
                    })
                    .catch(err => {
                        console.error(err);
                    });
            });
    });
