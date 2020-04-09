const Post = require('./Post');

test('trade direction:  {STRIKE}P', () => {

    var d = new Date(0);
    d.setUTCSeconds(1581033600);
    var p = new Post(d, 'TSLA 420P 4/17 (closest date to 4/20/20)', '');

    expect(p.tradeDirection).toBe(-1);
});

test('trade direction:  Short {TICKER}', () => {

    var d = new Date(0);
    d.setUTCSeconds(1581033600);
    var p = new Post(d, 'sell ZM? Elon Musk\'s SpaceX bans Zoom over privacy concerns', '');

    expect(p.tradeDirection).toBe(-1);
});


test('get prices', () => {

    var d = new Date(0);
    d.setUTCSeconds(1581033600);
    var p = new Post(d, 'sell ZM? Elon Musk\'s SpaceX bans Zoom over privacy concerns', '');

    expect(p.getPrices2 ('ZM', d)).toBe(-1);
});