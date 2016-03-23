var abb = require('./abbreviation'),
    configDB = require('./config/database.js'),
    elasticsearch = require('elasticsearch'),
    esClient = new elasticsearch.Client(configDB.getESConfig()),
    request = require('request'),
    readLine = require('readline'),
    csv = require('csv');

var createLoinc = function (fields) {
    var fullProperty = fields[2],
        fullTime = fields[3],
        fullSystem = fields[4],
        fullMethod = fields[6],
        propAbbreviationsLength = abb.property.length,
        timeAbbreviationsLength = abb.time.length,
        systemAbbreviationsLength = abb.system.length,
        methodAbbreviationsLength = abb.method.length;

    for (var i = 0; i < propAbbreviationsLength; i++) {
        fullProperty = fullProperty.replace(abb.property[i].key, abb.property[i].val);
    }

    for (var i = 0; i < timeAbbreviationsLength; i++) {
        fullTime = fullTime.replace(abb.time[i].key, abb.time[i].val);
    }

    for (var i = 0; i < systemAbbreviationsLength; i++) {
        fullSystem = fullSystem.replace(abb.system[i].key, abb.system[i].val);
    }

    for (var i = 0; i < methodAbbreviationsLength; i++) {
        fullMethod = fullMethod.replace(abb.method[i].key, abb.method[i].val);
    }

    return {
        loincNum: fields[0],
        component: fields[1],
        property: fields[2],
        fullProperty: fullProperty,
        timeAspect: fields[3],
        fullTimeAspect: fullTime,
        system: fields[4],
        fullSystem: fullSystem,
        methodType: fields[6],
        fullMethodType: fullMethod,
        status: fields[7],
        relatedNames: fields[8],
        units: fields[9],
        longCommonName: fields[10]
    };
};

module.exports.setup = function (callback) {
    var linesRead = 0,
        linesAdded = 0;

    // Setup ES index
    request
        .del('http://' + configDB.getESConfig().hosts[0] + '/' + configDB.elasticsearch.indexName) // First delete ES Index
        .on('error', function (err) {
            console.log('Error deleting index: ' + err);
        })
        .on('response', function () {
            console.log('Index deleted');

            esClient.indices.create({
                index: configDB.elasticsearch.indexName,
                updateAllTypes: false,
                body: {
                    settings: configDB.elasticsearch.settings
                }
            }, function (err, res) {
                if (err) {
                    console.log('Error creating index: ' + err);
                    return;
                }

                console.log('Index created');

                esClient.indices.putMapping({
                    index: configDB.elasticsearch.indexName,
                    type: 'loinc',
                    body: configDB.elasticsearch.mappings.loinc
                }, function (err, res) {
                    if (err) {
                        console.log('Error creating mapping: ' + err);
                        return;
                    }

                    console.log('ES Index Setup Done!');

                    // add all loincs to ES
                    var rl = readLine.createInterface({
                        input: require('fs').createReadStream('loinc.csv')
                    }).on('line', function (line) {
                        linesRead += 1;

                        if (linesRead % 200 === 0) {
                            rl.pause();
                            console.log('Lines read: ' + linesRead);
                        }

                        csv.parse(line, function(err, data) {
                            if(err) {
                                console.log('Error parsing line: ' + err);
                                linesAdded += 1;
                                return;
                            }

                            var fields = data[0],
                                loinc = createLoinc(fields);

                            esClient.index({
                                index: configDB.elasticsearch.indexName,
                                type: 'loinc',
                                body: loinc
                            }, function (err, res) {
                                if (err) {
                                    console.log('Error adding line: ' + err);
                                    return;
                                }

                                linesAdded += 1;

                                if (linesAdded % 200 === 0) {
                                    rl.resume();
                                    console.log('Lines added: ' + linesAdded);
                                }
                            });
                        });
                    }).on('close', () => {
                        console.log('All Lines read: ' + linesRead);
                        callback();
                    });
                });
            });
        });
};