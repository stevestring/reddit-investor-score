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

data.forEach ((post)=>
{
    if (post.hasTrade)
    {
        console.log(post.tradeDescription);
    }
});


//console.log(data.length);

};
