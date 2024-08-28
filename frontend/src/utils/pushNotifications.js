/* 

VAPID_KEY: {
    "subject": "mailto: <caiodossantosfelipe@hotmail.com>",
    "publicKey": "BMsWS36_MWF1nOUALU-uYZJ580yeYjc0yPUrbSdD-0l99Qo3y0RahKqXLlpc6mzaSvFKmgeF0p74GdIhFPRwPOg",
    "privateKey": "e3Imcdist2q4JcGlNkGxCmMC6q1JM56YxwdfKVvImTg"
}

*/

export const subscribeToPushNotifications = async () => {
    try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: 'BMsWS36_MWF1nOUALU-uYZJ580yeYjc0yPUrbSdD-0l99Qo3y0RahKqXLlpc6mzaSvFKmgeF0p74GdIhFPRwPOg'
        });

        // Send the subscription to your backend
        const response = await fetch('/api/push-subscription', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(subscription),
        });

        if (!response.ok) {
            throw new Error('Failed to save push subscription');
        }

        console.log('Push subscription saved successfully');
    } catch (error) {
        console.error('Error subscribing to push notifications:', error);
        // You might want to show an error message to the user here
    }
};

export const unsubscribeFromPushNotifications = async () => {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
        await subscription.unsubscribe();
        // Notify your backend about the unsubscription
        await fetch('/api/push-subscription', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(subscription),
        });
    }
};
