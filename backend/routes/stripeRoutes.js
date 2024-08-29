const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');

// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

const updateUserSubscription = async (email, subscriptionId, status) => {
    try {
        const updateData = {
            subscriptionId,
            subscriptionStatus: status,
            registrationCode: null // Clear the registration code once used
        };

        // Only update the username if it's provided
        if (email) {
            updateData.email = email;
        }

        const user = await User.findOneAndUpdate(
            { email },
            updateData,
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        console.log('User subscription updated:', user);
    } catch (error) {
        console.error('Error updating user subscription:', error);
    }
};

router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
    console.log('Webhook received!');
    const sig = req.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        console.log('Event constructed:', event.type);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            console.log('Checkout session completed:', session);
            
            // Generate a unique registration code
            const registrationCode = crypto.randomBytes(16).toString('hex');
            
            const customerEmail = session.customer_details?.email || session.customer_email;
            const customerUsername = session.customer_details?.name || session.customer_name;
            console.log(`Registration code for ${customerEmail}: ${registrationCode}`);
            
            // Update user's subscription status in your database
            await updateUserSubscription(customerEmail, session.subscription, 'active');
            
            // Log the registration data
            console.log('Registration data:', { username: customerUsername, email: customerEmail, subscriptionId: session.subscription, registrationCode });

            console.log(`Redirecting to ${process.env.FRONTEND_URL}/register?code=${registrationCode}`);

            // Return the redirect URL in the response
            return res.json({redirectUrl: `${process.env.FRONTEND_URL}/register?code=${registrationCode}`});

        case 'payment_intent.succeeded':
            const paymentIntentSucceeded = event.data.object;
            console.log('Payment succeeded:', paymentIntentSucceeded.id);
            break;
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
            const subscription = event.data.object;
            console.log(`Subscription ${event.type}:`, subscription.id);
            await updateUserSubscription(subscription.customer_email, subscription.id, subscription.status);
            break;
        case 'customer.created':
        case 'customer.updated':
            const customer = event.data.object;
            console.log(`Customer ${event.type}:`, customer.id);
            // Here you might want to update or create a user in your database
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.send();
});

module.exports = router;
