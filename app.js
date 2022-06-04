
var express = require('express');
var stripeController=require("./controllers/stripe.controller")

var app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
var cors = require('cors');
app.use(cors());


app.post(`/create-stripe-user`,stripeController.createStripeUser);
app.post(`/add-card-intent`,stripeController.createAddCardPendingIntent);
app.post(`/create-stripe-subscription`,stripeController.createSubscription);
app.post(`/update-subscription-method`,stripeController.updateDefaultPaymentMethodSubscription);
app.post(`/cancel-subscription`,stripeController.cancelSubscription);


app.listen(process.env.PORT || 3002,()=>{
  console.log("app is listening at ",3002)
})



module.exports = app;
