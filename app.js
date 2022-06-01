
var express = require('express');
var stripeController=require("./controllers/stripe.controller")

var app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.post(`/create-stripe-user`,stripeController.createStripeUser);
app.post(`/create-stripe-subscription`,stripeController.createSubscription);
app.post(`/update-subscription-method`,stripeController.updateDefaultPaymentMethodSubscription);
app.post(`/cancel-subscription`,stripeController.cancelSubscription);


app.listen(3000,()=>{
  console.log("app is listening at ",3000)
})



module.exports = app;