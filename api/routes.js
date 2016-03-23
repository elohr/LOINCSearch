var express = require('express'),
    router = express.Router(),
    path = require('path'),
    configDB = require('./config/database.js'),
    elasticsearch = require('elasticsearch'),
    esClient = new elasticsearch.Client(configDB.getESConfig());

router.get('/',function(req, res){
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

router.get('/search/:text', function(req, res) {
    var params = {
        index: configDB.elasticsearch.indexName,
        type: 'loinc',
        body: {
            size: 5,
            query: {
                multi_match : {
                    query : req.params.text,
                    fields : ['loincNum', 'component', 'property', 'fullProperty', 'timeAspect', 'fullTimeAspect', 'system', 'fullSystem', 'methodType', 'fullMethodType', 'relatedNames', 'longCommonName']
                }
            }
        },
        _source: 'loincNum, fullProperty, fullTimeAspect, fullSystem, fullMethodType, status, units, longCommonName'
    };

    esClient.search(params, function (err, results) {
        if (err) {
            console.log('Error searching: ' + err);
            res.json([]);
            return;
        }

        res.json(results.hits.hits);
    });
});

module.exports = router;