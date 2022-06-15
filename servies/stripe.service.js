

const stripe = require('stripe')("sk_test_51L5Yc7Jngle5KEdgd9M1AaGCTS1ykSc3r2rleOJIvlBybzCAuMrrMwgQkMts4dcdwbvfbXx2qtCAJ5y9PPF0DUib00EKCPOw1P");
const stripeUtils = require("../utils/stripe");
const admin = require('firebase-admin');
const serviceAccount = require('../services-account');
const { v4: uuidv4 } = require('uuid');



admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();





/**
 * Create a user
 * @param {email} stripeBody
 * @returns {StripeResponse}
 */
const getUserById=async (id)=>{
    const user = await db.collection('SignupSubscriber').doc(id).get();
    return user;
}

const createUser = async (email) => {
    const customer = await stripe.customers.create({email});
    return customer;
}

const createStripeUser = async (email) => {
    const stripe = await createUser(email);
    const id=uuidv4();
    await db.collection("Subscriber").doc(id).set({email,id,stripe_id:stripe.id,subscription_id:null,status:"deleted"});
    return ({email,id,stripe_id:stripe.id})
}


/**
 * create intent to save card details
 * @param {string} id
 * @returns {IntentObject}
 */
const createAddCardPendingIntent = async (stripe_id) => {

    const setupIntent = await stripe.setupIntents.create({
        customer: stripe_id,
    });
    return setupIntent;
};


/**
 * create subscription
 * @param {string} user_id
 * @param {string} payment_method_id
 * @returns {SubscriptionObject}
 */
const createSubscription = async (user_id, payment_method_id, subscriptionName) => {

    let user=await getUserById(user_id);
    if(user.exists){
        user=user.data();
    }else{
        return;
    }

        const defaultSubscriptions = stripeUtils.getSubscriptionByName(subscriptionName);
        if (defaultSubscriptions) {

            try {
                const subscription = await stripe.subscriptions.create({
                    customer: user.stripe_id,
                    items: [
                        {
                            quantity: 1,
                            price: defaultSubscriptions.id,
                        },
                    ],
                    default_payment_method: payment_method_id,
                    trial_end: stripeUtils.getSubscriptionTrialPeriod().unix(),
                    metadata:{user_id}
                });
                return {subscription};
            } catch (e) {
                throw new Error(e);
            }
        } else {
            throw new Error('Subscription not found');
        }
};


/**
 * pay subscription manually
 * @param {string} user_id
 * @returns {SubscriptionObject}
 */
const createPaySubscriptionIntent = async (user_id) => {

    const user = await userService.getUserById(user_id);
    const subscription = await getSubscriptionByUserId(user_id);
    const defaultSubscriptions = stripeUtils.getSubscriptionByName(subscription.name);
    if (defaultSubscriptions) {
        try {
            const session = await stripe.checkout.sessions.create({
                customer: user.stripeId,
                line_items: [
                    {
                        quantity: 1,
                        price: defaultSubscriptions.id,

                    },
                ],
                mode: 'subscription',
                success_url: 'https://music-pass-frontend.web.app/subscription-success',
                cancel_url: 'https://music-pass-frontend.web.app/',
                //success_url: 'http://localhost:3002/subscription-success',
                //cancel_url: 'http://localhost:3002',
            });

            return session;
        } catch (e) {
            throw new Error('Subscription not found! ' + e);
        }
    } else {
        throw new Error('Subscription not found!');
    }
};


/**
 * update subscription method
 * @param {string,string} user_id,paymentMethod
 * @returns {SubscriptionObject}
 */
const updateSubscriptionPaymentMethod = async (subscription_id,subscriptionName, paymentMethod) => {

    const defaultSubscriptions = stripeUtils.getSubscriptionByName(subscriptionName);
    if (defaultSubscriptions) {
        try {
            const updateSubscription = await stripe.subscriptions.update(
                subscription_id,
                {
                    default_payment_method: paymentMethod
                }
            );

            return updateSubscription;
        } catch (e) {
            throw new Error('Subscription not found! ' + e);
        }
    } else {
        throw new Error('Subscription not found!');
    }
};


/**
 * cancel subscription
 * @param {string} user_id
 * @returns {SubscriptionObject}
 */
const cancelSubscription = async (subscription_id) => {

    const subscriptionCanceled = await stripe.subscriptions.del(subscription_id);
    return subscriptionCanceled;
};

/**
 * reactivate canceled subscription
 * @param {string} user_id
 * @returns {SubscriptionObject}
 */
const reactivateSubscription = async (user_id, subscriptionName) => {


    const userSubscription = await getSubscriptionByUserId(user_id);
    const subscription = await getSubscriptionByUserId(user_id);
    const defaultSubscriptions = stripeUtils.getSubscriptionByName(subscription.name);
    if (defaultSubscriptions) {
        const subscription = await stripe.subscriptions.retrieve(userSubscription.stripe_subscription_id);
        const subscriptionReactivated = await stripe.subscriptions.update(userSubscription.stripe_subscription_id, {
            cancel_at_period_end: false,
            proration_behavior: 'create_prorations',
            items: [{
                id: subscription.items.data[0].id,
                price: defaultSubscriptions.id,
            }]
        });

        return subscriptionReactivated;
    } else {
        throw new Error('Subscription not found!');
    }
};


/**
 * update payment method
 * @param {string} user_id
 * @param {string} payment_method_id
 * @returns {PaymentMethodObject}
 */
const createCardInfo = async (user_id, payment_method_id) => {

    const user = await userService.getUserById(user_id);
    const paymentMethodDetails = await stripe.paymentMethods.retrieve(
        payment_method_id
    );
    if (paymentMethodDetails) {
        user.payment_method_id = payment_method_id;
        user.billingInformation = {
            fullName: paymentMethodDetails.billing_details.name,
            cardNumber: paymentMethodDetails.card.last4,
            expiryDate: `${paymentMethodDetails.card.exp_month}/${paymentMethodDetails.card.exp_year}`
        }
        await user.save();
    }
    return user;
};


/**
 * create credit payment
 * @param {string} user_id
 * @param {string} payment_method_id
 * @returns {PaymentMethodObject}
 */
const createCreditPayment = async (user_id, credit) => {

    try {
        const creditAmount = 0.5;
        const amount = (credit * creditAmount) * 100;

        const user = await userService.getUserById(user_id);
        const subscription = await getSubscriptionByUserId(user_id);

        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: "usd",
            customer: user.stripeId,
            payment_method: user.payment_method_id,
            metadata: {
                user_id,
                subscription_id: subscription.stripe_subscription_id,
                credit
            }
        });
        return paymentIntent;
    } catch (e) {
        throw new Error(e.message);
    }
};


/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getSubscriptionByUserId = async (id) => {
    return await StripeSubscription.findOne({user: ObjectId(id)});
};


/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const updateSubscriptionStatus = async (id) => {
    return Subscription.update(id);
};

const saveSubscription = async (user_id, stripe_subscription_id, subscriptionName, credit, eventsPerMonth, price) => {
    const subscription = {
        active: true,
        user: user_id,
        created_at: stripeUtils.getCurrentDate(),
        expires_at: stripeUtils.getSubscriptionExpireDate(),
        stripe_subscription_id,
        name: subscriptionName,
        status: "active",
        credit,
        eventsPerMonth,
        price
    };
    const user = await userService.getUserById(user_id);
    user.credits = credit;
    await user.save();
    const storedSubscription = await StripeSubscription.create(subscription);
    return storedSubscription;
}

module.exports = {
    createAddCardPendingIntent,
    createSubscription,
    createPaySubscriptionIntent,
    cancelSubscription,
    reactivateSubscription,
    getSubscriptionByUserId,
    updateSubscriptionPaymentMethod,
    createCreditPayment,
    createStripeUser
}
