const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

router.get('/session/:sessionId', async (req, res) => {
    const { sessionId } = req.params;
    console.log(`Retrieving session data for ${sessionId}`);

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        console.log('Session retrieved:', session);

        const customerEmail = session.customer_details.email;
        const subscriptionId = session.subscription;

        console.log(`Session data found: email=${customerEmail}, subscriptionId=${subscriptionId}`);
        res.json({ email: customerEmail, subscriptionId });
    } catch (error) {
        console.error('Error retrieving session:', error);
        res.status(404).json({ error: 'Session not found or expired' });
    }
});

module.exports = router;
