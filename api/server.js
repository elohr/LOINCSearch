var setupES = process.argv.length > 3 && process.argv[3] === 'setup',
    express = require('express'),
    app = express(),
    server = require('http').Server(app),
    path = require('path'),
    routes = require('./routes.js'),
    config = require('./config/config.js'),
    setup = require('./setup.js');

app.use('/css', express.static(path.join(__dirname, '../dist/css')));
app.use('/js', express.static(path.join(__dirname, '../dist/js')));
app.use('/i', express.static(path.join(__dirname, '../dist/i')));

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
});

app.use('/', routes);

var startServer = function() {
    server.listen(config.port, config.host, function () {
        var host = config.host;
        var port = config.port;

        console.log('App listening at http://%s:%s', host, port);
    });
};

if(setupES) {
    setup.setup(startServer);
} else {
    startServer();
}
