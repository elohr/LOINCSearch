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
        longCommonName: fields[10],
        utilization: fields[12]
    };
};

module.exports.getMapping = function (fields) {
    return {
        name: fields[1],
        reference_range_low: fields[5],
        reference_range_high: fields[6],
        reference_range_string: fields[7],
        units: fields[9]
    };
};

module.exports.addMappings = function (callback, lines, linesLength, startPos) {
    var startPos = startPos || 0,
        lineContents;

    if (lines == null) {
        lineContents = require('fs').readFileSync(__dirname + '/name_mappings.csv').toString();
    }

    var lines = lines || lineContents.split('\n'),
        linesLength = linesLength || lines.length;

    console.log('Total Mappings left are: ' + (linesLength - startPos));

    csv.parse(lines[startPos], function (err, data) {
        startPos += 1;

        if (err) {
            console.log('Error parsing line mapping: ' + err);
            module.exports.addMappings(callback, lines, linesLength, startPos);
            if (startPos === linesLength) {
                console.log('All Lines processed mapping: ' + startPos);
                callback();
            }
            return;
        }

        var fields = data[0];

        if (fields && fields.length > 0) {
            var mapping = module.exports.getMapping(fields);

            esClient.get({
                index: configDB.elasticsearch.indexName,
                type: 'loinc',
                id: fields[16]
            }, function (err, res) {
                if (err) {
                    console.log('Error getting loinc to add mapping: ' + err);
                    module.exports.addMappings(callback, lines, linesLength, startPos);
                    if (startPos === linesLength) {
                        console.log('All Lines processed mapping: ' + startPos);
                        callback();
                    }
                    return;
                }

                if (!res.found) {
                    console.log('LOINC was not found when adding mapping');
                    module.exports.addMappings(callback, lines, linesLength, startPos);
                    if (startPos === linesLength) {
                        console.log('All Lines processed mapping: ' + startPos);
                        callback();
                    }
                    return;
                }

                if (res._source.alts) {
                    if (res._source.alts instanceof Array) {
                        res._source.alts.push(mapping);
                    } else {
                        res._source.alts = [res._source.alts, mapping];
                    }
                } else {
                    res._source.alts = [mapping];
                }

                esClient.update({
                    index: configDB.elasticsearch.indexName,
                    type: 'loinc',
                    id: fields[16],
                    refresh: true,
                    body: {
                        doc: res._source
                    }
                }, function (err, res) {
                    if (err) {
                        console.log('Error adding line mapping: ' + err);
                        module.exports.addMappings(callback, lines, linesLength, startPos);
                        if (startPos === linesLength) {
                            console.log('All Lines processed mapping: ' + startPos);
                            callback();
                        }
                        return;
                    }

                    module.exports.addMappings(callback, lines, linesLength, startPos);
                    if (startPos === linesLength) {
                        console.log('All Lines processed mapping: ' + startPos);
                        callback();
                    }
                });
            });
        } else {
            console.log('Could not get fields from line');
            module.exports.addMappings(callback, lines, linesLength, startPos);
            if (startPos === linesLength) {
                console.log('All Lines processed mapping: ' + startPos);
                callback();
            }
        }
    });
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
                        input: require('fs').createReadStream(__dirname + '/loinc_complete.csv')
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
                                body: loinc,
                                id: fields[11]
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
                        console.log('All Lines read: ' + linesRead + '. Will add mappings in 5 seconds.');

                        // after 5 seconds, to make sure all loinc codes have been added, read the mapping files and add each mapping as alt names
                        setTimeout(function () {
                            console.log('Adding mappings...');
                            module.exports.addMappings(callback);
                        }, 5000);
                    });
                });
            });
        });
};