var express = require('express');
var serveStatic = require('serve-static')
var campaignList = require('./campaign-list.js');
var campaignData = require('./campaign-data.js');

var app = express();

disableCORS(app);

app.get('/campaigns', campaignList);
app.get('/campaigns/:cid', campaignData);

app.use(serveStatic(__dirname + '/../test'))

app.use(function(req, res) {
  res.sendFile(__dirname.replace("server", "") + 'test/index.html');
});

// Run the server:
var server = app.listen(3000, '0.0.0.0', function() {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});


function disableCORS(app){
    app.use(function(req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      next();
    });
}
