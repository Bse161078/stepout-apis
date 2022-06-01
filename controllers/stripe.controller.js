const httpStatus = require('http-status');
const stripeService = require('../servies/stripe.service');







const createStripeUser = (async (req, res) => {

    const stripe=await stripeService.createStripeUser(req.body.email)
    res.status(httpStatus.OK).send(stripe);
});


const createAddCardPendingIntent = (async (req, res) => {
    const intent = await stripeService.createAddCardPendingIntent(req.body.id);
    res.status(httpStatus.OK).send({clientSecret: intent.client_secret});
});


const createSubscription = (async (req, res) => {
    try {
        const subscription = await stripeService.createSubscription(req.body.stripe_id, req.body.paymentMethod, req.body.subscriptionName);
        res.status(httpStatus.OK).send(subscription);
    } catch (e) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).send(e);
    }
});

const updateDefaultPaymentMethodSubscription = (async (req, res) => {
    try {
        const session = await stripeService.updateSubscriptionPaymentMethod(req.body.subscription_id,req.body.subscriptionName,
            req.body.paymentMethod);
        res.status(httpStatus.OK).send(session);
    } catch (e) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).send(e);
    }
});


const cancelSubscription = (async (req, res) => {
    const subscription = await stripeService.cancelSubscription(req.body.subscription_id);
    res.status(httpStatus.OK).send(subscription);
});




module.exports = {
    createAddCardPendingIntent,
    createSubscription,
    cancelSubscription,
    updateDefaultPaymentMethodSubscription,
    createStripeUser
}
