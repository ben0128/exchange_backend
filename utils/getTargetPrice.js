const axios = require("axios");
const alphaApiKey = process.env.ALPHA_API_KEY;
const interval = "1min";

const getTargetPrice = (targetName) => {
  return axios
    .get(
      `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${targetName}&interval=${interval}&apikey=${alphaApiKey}`
    )
    .then((res) => {
      const intradayData = res.data["Time Series (1min)"];
      const latestData = intradayData[Object.keys(intradayData)[0]];
      const latestPrice = latestData["1. open"];
      // console.log(targetName ,res);
      return latestPrice;
    })
    .catch((err) => {
      console.error(err);
    })
}

module.exports = getTargetPrice;
