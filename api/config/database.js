var debug = process.argv.length > 2 && process.argv[2] === 'debug',
    ES = '192.168.2.15:9200';

if (!debug) {
    ES = 'elasticsearch:9200';
}

module.exports = {
    getESConfig: function () {
        return {
            hosts: [ES],
            apiVersion: '2.0'
        };
    },

    elasticsearch: {
        settings: {
            number_of_shards: 1,
            number_of_replicas: 0,
            analysis: {
                filter: {
                    nGram_filter: {
                        type: 'nGram',
                        min_gram: 2,
                        max_gram: 20,
                        token_chars: ["letter", "digit"]
                    },
                    length_filter: {
                        type: 'length',
                        min: 2,
                        max: 20
                    }
                },
                analyzer: {
                    nGram_Analyzer: {
                        type: 'custom',
                        tokenizer: 'standard',
                        filter: ['lowercase', 'asciifolding', 'nGram_filter']
                    },
                    whitespace_analyzer: {
                        "type": 'custom',
                        "tokenizer": 'standard',
                        "filter": ['lowercase', 'asciifolding', 'length_filter']
                    }
                }
            }
        },
        indexName: 'loinc',
        mappings: {
            loinc: {
                properties: {
                    loincNum: {type: 'string', index: 'not_analyzed'},
                    component: {type: 'string'},

                    property: {type: 'string'},
                    fullProperty: {type: 'string'},

                    timeAspect: {type: 'string'},
                    fullTimeAspect: {type: 'string'},

                    system: {type: 'string'},
                    fullSystem: {type: 'string'},

                    methodType: {type: 'string'},
                    fullMethodType: {type: 'string'},

                    status: {type: 'string', index: 'not_analyzed'},
                    units: {type: 'string', index: 'not_analyzed'},

                    relatedNames: {type: 'string'},

                    longCommonName: {
                        type: 'string',
                        analyzer: 'nGram_Analyzer',
                        search_analyzer: 'whitespace_analyzer'
                    }
                }
            }
        }
    }
};
