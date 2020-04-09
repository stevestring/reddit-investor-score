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

    //spy400qqq300 needs testing
    get tradeDirection()
    {
        if (this.hasTrade)
        {
            var buySell=1;
            var putCall=1;
            //look for BUY/SELL
            if (this.title.search(/(sell|short)/i)!=-1)//Trade for SPY
            {
                buySell = -1; //Sell
            }

            if (this.title.search(/put/i)>0 || this.title.search(/[0-9]{1,5}[P]/i)!=-1)
            {
                putCall = -1;
            }

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
            return this.performance().then((p)=> {
                return this.created +' '+ this.longShort + ' ' + this.tradeTicker + ' ' 
                // + p.price
                +' "'+this.title + '"';
            })

        }
        else
        {
            return null;
        }
        
    }

    getPriceFromArray(date, priceArray)
    {       
        //console.log (date);
        date.setHours(0,0,0,0);

        let arrayDate;
        for (let i=0; i<priceArray.length; i++)
        {
            //console.log(priceArray[i].date);
            arrayDate = new Date(parseInt(priceArray[i].date)*1000);
            //arrayDate.setUTCSeconds(priceArray[i].date);
            //console.log(date +':'+ arrayDate.toDateString());
            if (date <= arrayDate && 
                priceArray[i].adjclose != null) //Dividend entry - keep moving
            {
                //console.log(arrayDate.toDateString() +':'+ priceArray[i].adjclose);
                return {date: arrayDate, price: priceArray[i].adjclose};
            }
        }
        return 'price';
    }


    getPrices(startDate, endDate) {

        return new Promise((resolve, reject) => {
      
            yahooStockPrices.getHistoricalPrices(startDate.getMonth(), startDate.getDate(), 
            startDate.getFullYear() , endDate.getMonth(), endDate.getDate(), endDate.getFullYear(),
            this.tradeTicker, '1d',(err, prices)=>{
                if (err) reject(err);
                else resolve(prices);
            });         
        });      
    }



    ///TODO Try to send get prices as an argument to 
    performance()
    {
        if (!this.hasTrade)
        {
            return null;
        }
        else
        {
            let createDate = this.created;
            let thirtyFiveDayDate = new Date (this.created);            

            thirtyFiveDayDate.setDate(createDate.getDate()+35);

            return this.getPrices(createDate, thirtyFiveDayDate)
            .then(prices=> {
                let perfs = [];
                let basis;
                let price;

                prices = prices.reverse(); 

                //Get first trading day since post (i.e. account for weekends and holidays)
                let firstTradeDate = this.getPriceFromArray(createDate,prices);
                let tradeDate = firstTradeDate.date;

                let oneDayDate = new Date (tradeDate);
                oneDayDate.setDate(oneDayDate.getDate()+1);
                let twoDayDate = new Date (tradeDate);
                twoDayDate.setDate(twoDayDate.getDate()+2);
                let sevenDayDate = new Date (tradeDate);
                sevenDayDate.setDate(sevenDayDate.getDate()+7);
                let thirtyDayDate = new Date (tradeDate);
                thirtyDayDate.setDate(thirtyDayDate.getDate()+30);                
                
                basis = this.getPriceFromArray(tradeDate,prices);

                price = this.getPriceFromArray(oneDayDate,prices);
                perfs.push ({days: 1, tradeDate:basis.date, tradePrice: basis.price, 
                    perfDate:price.date, perfPrice:price.price, performance: this.calcPerf(basis.price, price.price, this.tradeDirection)})
                
                price = this.getPriceFromArray(twoDayDate,prices);
                perfs.push ({days: 2, tradeDate:basis.date, tradePrice: basis.price, 
                    perfDate:price.date, perfPrice:price.price, performance: this.calcPerf(basis.price, price.price, this.tradeDirection)})

                price = this.getPriceFromArray(sevenDayDate,prices);
                perfs.push ({days: 7, tradeDate:basis.date, tradePrice: basis.price, 
                    perfDate:price.date, perfPrice:price.price, performance: this.calcPerf(basis.price, price.price, this.tradeDirection)})

                price = this.getPriceFromArray(thirtyDayDate,prices);
                perfs.push ({days: 30, tradeDate:basis.date, tradePrice: basis.price, 
                    perfDate:price.date, perfPrice:price.price, performance: this.calcPerf(basis.price, price.price, this.tradeDirection)})

                return perfs;

            })// passed result of getPrices
            .catch(err => {             // called on any reject
                console.log('error', err);
            });
            //return retVal;            
        }

    }
    
    calcPerf(startPrice, endPrice, direction)
    {
        return (endPrice-startPrice)/startPrice * direction* 100;
    }
  }
  
  module.exports.getPrices2 = function(ticker, startDate) {

    let endDate = new Date (startDate);  
    endDate.setDate(endDate.getDate()+5);

    return new Promise((resolve, reject) => {
  
        yahooStockPrices.getHistoricalPrices(startDate.getMonth(), startDate.getDate(), 
        startDate.getFullYear() , endDate.getMonth(), endDate.getDate(), endDate.getFullYear(),
        ticker, '1d',(err, prices)=>{
            if (err) reject(err);
            else resolve(prices);
        });         
    });      
}
  module.exports = Post;