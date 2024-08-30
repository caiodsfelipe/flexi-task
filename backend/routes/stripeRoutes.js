const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');

router.get('/session/:sessionId', async (req, res) => {
    const { sessionId } = req.params;

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        const customerEmail = session.customer_details.email;
        const paymentStatus = session.payment_status;

        res.json({ email: customerEmail, paymentStatus });
    } catch (error) {
        res.status(404).json({ error: 'Session not found or expired' });
    }
});

// Stripe webhook handler
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        
        try {
            // Retrieve the user by email and update their payment status
            const user = await User.findOne({ email: session.customer_details.email });
            if (user) {
                user.paymentStatus = 'paid';
                await user.save();
            }
        } catch (error) {
            //
        }
    }

    // Return a response to acknowledge receipt of the event
    res.json({received: true});
});

module.exports = router;
