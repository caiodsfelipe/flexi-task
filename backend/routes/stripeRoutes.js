const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');

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

// Add this new route for the webhook
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
        console.log('Webhook route hit');
        const sig = req.headers['stripe-signature'];
        let event;

        try {
            event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
        } catch (err) {
            console.error('Webhook signature verification failed:', err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        // Handle the event
        switch (event.type) {
            case 'customer.subscription.updated':
                const subscriptionToUpdate = event.data.object;
                await updateUserSubscription(subscriptionToUpdate);
                break;
            case 'customer.subscription.deleted':
                const subscriptionToDelete = event.data.object;
                await updateUserSubscription(subscriptionToDelete);
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        res.json({received: true});
    }
);

async function updateUserSubscription(subscription) {
    const subscriptionId = subscription.id;
    const status = subscription.status;
    
    console.log(`Updating subscription ${subscriptionId} with status: ${status}`);

    try {
        const user = await User.findOne({ subscriptionId });
        if (user) {
            const oldStatus = user.subscriptionStatus;
            user.subscriptionStatus = status;
            await user.save();
            console.log(`Updated subscription status for user ${user.email} from ${oldStatus} to ${status}`);
        } else {
            console.log(`No user found with subscription ID ${subscriptionId}`);
        }
    } catch (error) {
        console.error('Error updating user subscription:', error);
    }
}

module.exports = router;
