'use strict';
const Post = require('./Post.js');
const snoowrap = require('snoowrap');
const secrets = require('./secrets.json');
const args = process.argv.slice(2);

scrapeSubreddit(args[0]);

async function scrapeSubreddit(userName ) {
// Alternatively, just pass in a username and password for script-type apps.
const r = new snoowrap({
    userAgent: secrets.userAgent,
    clientId: secrets.clientId,
    clientSecret: secrets.clientSecret,
    username: secrets.username,
    password: secrets.password
});


const userSubmissions= await r.getUser(userName).getSubmissions();

let data = [];
userSubmissions.forEach((post) => {
    if (post.subreddit.display_name==='wallstreetbets')
    {
        var d = new Date(0);
        d.setUTCSeconds(post.created_utc);

        var p = new Post(d, post.title, post.selftext);

        data.push(
            p
        )
    }
});

// console.log(await data[0].tradeDescription);
// console.log(await data[2].tradeDescription);

for (var i=0; i<data.length; i++)
{
    if (data[i].hasTrade)
    {
        console.log(await data[i].tradeDescription);
        console.log(await data[i].performance());
    }
}

//Test without Reddit API
    // var d = new Date(0);
    // d.setUTCSeconds(1581033600);
    // var p = new Post(d, 'TSLA 420P 4/17 (closest date to 4/20/20)', '');
    // console.log(await p.tradeDescription);
    // console.log(await p.performance());

};

