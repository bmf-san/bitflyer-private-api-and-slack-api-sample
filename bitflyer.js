var request = require('request');
var crypto = require('crypto');
var async = require('async');

var key = 'YOUR_KEY';
var secret = 'YOUR_SECRET';

var timestamp = Date.now().toString();
var sign = crypto.createHmac('sha256', secret).update(timestamp + 'GET' + '/v1/me/getbalance').digest('hex');

var requests = [{
    url: 'https://api.bitflyer.jp/v1/me/getbalance',
    headers: {
        'ACCESS-KEY': key,
        'ACCESS-TIMESTAMP': timestamp,
        'ACCESS-SIGN': sign,
        'Content-Type': 'application/json'
    }
}, {
    url: 'https://api.bitflyer.jp/v1/getexecutions'
}];

async.map(requests, function(obj, callback) {
    request(obj, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            var body = JSON.parse(body);
            callback(null, body);
        } else {
            callback(error || response.statusCode);
        }
    });
}, function(err, results) {
    if (err) {
        console.log(err);
    } else {
        var jpy_available = parseInt(results[0][0]['available']);
        var btc_available = results[0][1]['available'];
        var price = parseInt(results[1][1]['price']);
        var total_assets = Math.floor(btc_available*price);

        var data = JSON.stringify({
            "attachments": [{
                "fallback": "bitflyer資産情報",
                "color": "danger",
                "title": "bitflyer資産情報",
                "text": "現在保有しているBTCは" + btc_available + "です",
                "fields": [{
                    "title": "BTC総資産",
                    "value": total_assets,
                    "short": true
                }, {
                    "title": "JPY(残高)",
                    "value": jpy_available + '円',
                    "short": true
                }]
            }],
            "username": "your-bot-name",
            "icon_url": "/path/to/img",
            "channel": "#yourslackchannel"
        });

        var options = {
            url: 'https://hooks.slack.com/services/WEBHOOK_TOKEN',
            form: 'payload=' + data,
            json: true
        };

        request.post(options, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(body.name);
            } else {
                console.log('error: ' + response.statusCode + body);
            }
        });
    }
});
