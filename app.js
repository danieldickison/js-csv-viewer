var express = require('express'),
    app = express(),
    http = require('http'),
    https = require('https'),
    url = require('url');

app.set('view engine', 'ejs');
app.locals.googleAnalyticsID = process.env.GOOGLE_ANALYTICS_ID;
app.locals.repoURL = 'https://github.com/danieldickison/js-csv-viewer';

app.use(express.logger('dev'));
app.use(express.errorHandler());
app.use(express.static(__dirname + '/public'));
app.get('/', function (req, res) {
    res.render('index');
});
app.get('/remote-csv', function (req, res, next) {
    var urlStr = req.query.url,
        urlParsed = url.parse(urlStr);
    console.log('proxying remote csv url: ', urlStr);
    (urlParsed.protocol === 'https:' ? https : http).get(urlParsed, function (httpRes) {
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
