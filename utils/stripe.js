const moment=require('moment');
const getDefaultPriceId="price_1KzbbIFJ50BG2GSlmuIoyZ2M";

const DEFAULT_SUBSCRIPTIONS=[{name:"Dip",id:"price_1L2HI7FJ50BG2GSlEYCo9Pd8",price:"$15",credit:6,eventsPerMonth:"1"},
  {name:"Lite",id:"price_1L2HImFJ50BG2GSlFQPym5C5",price:"$49",credit:23,eventsPerMonth:"2-3"},
  {name:"Enthusiast",id:"price_1L2HJGFJ50BG2GSlh6hi9EkG",price:"$99",credit:48,eventsPerMonth:"3-4"},
  {name:"Fan",id:"price_1L2HKTFJ50BG2GSlgN50su7M",price:"$149",credit:68,eventsPerMonth:"5-6"},
  {name:"Pro",id:"price_1L2HKvFJ50BG2GSl40XOI0P9",price:"$199",credit:100,eventsPerMonth:"8-10"}];



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

