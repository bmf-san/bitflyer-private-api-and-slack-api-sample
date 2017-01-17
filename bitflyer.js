var request = require('request');
var crypto = require('crypto');

var key = 'your_bitflyer_api';
var secret = 'your_bitflyer_secret';

var timestamp = Date.now().toString();
var method = 'GET';
var path = '/v1/me/getbalance';

var text = timestamp + method + path;
var sign = crypto.createHmac('sha256', secret).update(text).digest('hex');

var options = {
        url: 'https://api.bitflyer.jp' + path,
        method: method,
        headers: {
        'ACCESS-KEY': key,
        'ACCESS-TIMESTAMP': timestamp,
        'ACCESS-SIGN': sign,
        'Content-Type': 'application/json'
    }
};

request(options, function (err, response, payload) {
    var hoge = 'hoge';

    var data = JSON.stringify({"text": payload, "username": "your_bot_name", "icon_url": "your_icon_url","channel": "#channel_name"});

    var options = {
        url: 'your_slack_webhookurl',
        form: 'payload=' + data,
        json: true
    };

    request.post(options, function(error, response, body){
        if (!error && response.statusCode == 200) {
            console.log(body.name);
        } else {
            console.log('error: '+ response.statusCode + body);
        }
    });
});
