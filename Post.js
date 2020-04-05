const tickers = require('./Tickers.json')
const tickerRegEx = '\\b'+Object.keys(tickers).join('\\b|\\b')+'\\b/g'
var yahooStockPrices = require('yahoo-stock-prices');
//console.log(tickerRegEx);

class Post {
    
    constructor(created, title, text) {
      this.created = created;
      this.title = title;
      this.text = text;
    }


    get hasTrade() {     
        if (this.tradeTicker != null)
        {
            return true;
        }
        return false;
    }

    get tradeDirection()
    {
        if (this.hasTrade)
        {
            var buySell=1;
            var putCall=1;
            //look for BUY/SELL
            if (this.title.search(/sell|short/i)>0)//Trade for SPY
            {
                buySell = -1; //Sell
            }

            if (this.title.search(/put/i)>0 || this.title.search(/[0-9]{1,5}[P]/i)>0)
            {
                putCall = -1;
            }

            //console.log (buySell + ':'+putCall);

            return buySell * putCall;
        }
        else
        {
            return 0;
        }
    }

    get longShort()
    {
        if (this.hasTrade)
        {
            if (this.tradeDirection === 1)
            {
                return "LONG";
            }
            else
            {
                return "SHORT";        
            }
        }
    }

    get tradeTicker()
    {
        let tickers = this.title.match(tickerRegEx);

        if (tickers!= null)
        {
            return tickers[0];
        }
        else
        {
            return null;
        }
    }

    get tradeDescription()
    {
        if (this.hasTrade)
        {
            return this.created +' '+ this.longShort + ' ' + this.tradeTicker + ' ' + this.performance
            +' "'+this.title + '"';
        }
        else
        {
            return null;
        }
    }

    getPriceFromArray(date, priceArray)
    {
        //var retVal = new Object();
        date.setHours(0,0,0,0);
        
        let arrayDate;
        for (let i=0; i<priceArray.length; i++)
        {
            //console.log(priceArray[i].date);
            arrayDate = new Date(parseInt(priceArray[i].date)*1000);
            //arrayDate.setUTCSeconds(priceArray[i].date);
            //console.log(date +':'+ arrayDate.toDateString());
            if (date <= arrayDate)
            {
                return {date: arrayDate.toDateString(), price: priceArray[i].adjclose};
            }
        }
        return null;
    }

    get performance()
    {
        if (!this.hasTrade)
        {
            return null;
        }
        else
        {
            let tradeDate = this.created; //If weekend, walk forward
            //console.log (this.created);
            //console.log (tradeDate.getMonth()+1+'/'+ tradeDate.getDate()+'/'+  tradeDate.getFullYear())
            let oneDayDate = new Date (tradeDate);
            oneDayDate.setDate(oneDayDate.getDate()+1);
            let twoDayDate = new Date (tradeDate);
            twoDayDate.setDate(twoDayDate.getDate()+2);
            let sevenDayDate = new Date (tradeDate);
            sevenDayDate.setDate(sevenDayDate.getDate()+7);
            let thirtyDayDate = new Date (tradeDate);
            thirtyDayDate.setDate(thirtyDayDate.getDate()+30);

            let tradePrice;
            let oneDayReturn;
            let twoDayReturn;
            let sevenDayReturn;
            let thirtyDayReturn;

            // console.log (tradeDate);
            // console.log (oneDayDate);
            // console.log (twoDayDate);
            // console.log (sevenDayDate);
            // console.log (thirtyDayDate);
            var prices;
            var self = this;
            
            
            yahooStockPrices.getHistoricalPrices(tradeDate.getMonth(), tradeDate.getDate(), tradeDate.getFullYear()
                , thirtyDayDate.getMonth(), thirtyDayDate.getDate(), thirtyDayDate.getFullYear(),this.tradeTicker, '1d', 
                function(err, yPrices)
                { 
                    if (err) {
                        return console.log(err);
                    }

                    prices = yPrices.reverse();
                    //console.log(prices); 
                    //console.log (tradePrice);
                    tradePrice = self.getPriceFromArray(tradeDate,prices);
                    //console.log(tradePrice);
                    return tradePrice;
                });
            
            
            //console.log(prices);
            //tradePrice = this.getPriceFromArray(tradeDate,prices);

        }

    }

  }

  module.exports = Post;