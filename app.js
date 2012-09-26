var express = require('express'),
    app = express(),
    http = require('http'),
    url = require('url');

app.use(express.logger('dev'));
app.use(express.errorHandler());
app.use(express.static(__dirname + '/public'));
app.get('/remote-csv', function (req, res, next) {
    var urlStr = req.query.url;
    console.log('proxying remote csv url: ', urlStr);
    http.get(url.parse(urlStr), function (httpRes) {
        httpRes
        .on('data', function (data) {
            res.write(data);
        })
        .on('end', function () {
            res.end();
        });
    }).on('error', function (err) {
        next(err);
    });
});

var port = process.env.VCAP_APP_PORT || 3001;
app.listen(port);
console.log('Listening on port ' + port);
