const moment=require('moment');
const getDefaultPriceId="price_1KzbbIFJ50BG2GSlmuIoyZ2M";

const DEFAULT_SUBSCRIPTIONS=[{name:"StepoutSubscribtion",id:"price_1L5Yk4Jngle5KEdgE5WZB68V",price:"$15",credit:6,eventsPerMonth:"1"}];



const  getSubscriptionByName=(name)=>{
  return DEFAULT_SUBSCRIPTIONS.find((subscription)=>subscription.name===name)
}

const getSubscriptionTrialPeriod=()=>{
  const trialPeriod=moment(new Date()).add(2,"minutes");
  return trialPeriod;
}
const getCurrentDate=()=>{
  const currentDate=moment().toDate();
  return currentDate;
}

const getSubscriptionExpireDate=()=>{
  const subscriptionExpireDate=moment(new Date()).add(2,"minutes").toDate();
  return subscriptionExpireDate;
}

module.exports={
  getSubscriptionTrialPeriod,
  getDefaultPriceId,
  getCurrentDate,
  getSubscriptionExpireDate,
  getSubscriptionByName
}

