var debug = process.argv.length > 2 && process.argv[2] === 'debug';

var host = '0.0.0.0',
    port = 80;

if(debug) {
    port = 3030;
}

module.exports = {
    host: host,
    port: port
};