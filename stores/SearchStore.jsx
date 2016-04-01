var AppDispatcher = require('../dispatcher/AppDispatcher'),
    SearchConstants = require( '../constants/SearchConstants'),
    request = require('superagent'),
    EventEmitter = require('events'),
    assign = require('object-assign');

//var BASE_URL = 'http://192.168.2.15:3030/';
var BASE_URL = 'http://6d2ecc22.ngrok.io/';

var _results = {
    emptySearch: true,
    searchString: '',
    results: []
};

var search = function(text) {
    if(text.length > 0) {
        // todo: show loading

        request.get(BASE_URL + 'search/' + text)
            .end(function (err, res) {
                // todo: hide loading

                if (err) {
                    console.log('There was an error: ' + err);
                    return;
                }

                _results = {
                    emptySearch: false,
                    searchString: text,
                    results: res.body
                };

                SearchStore.emitResultsChange();
            });
    } else {
        _results = {
            emptySearch: true,
            results: []
        };

        SearchStore.emitResultsChange();
    }
};

var clear = function() {
    _results = {
        emptySearch: true,
        results: []
    };

    SearchStore.emitSearchClearedEvent();
    SearchStore.emitResultsChange();
};

var SearchStore = assign({}, EventEmitter.prototype, {
    RESULT_EVENT: 'result',
    SEARCH_CLEARED_EVENT: 'results_cleared',

    getState: function() {
        return _results;
    },

    emitResultsChange: function() {
        this.emit(this.RESULT_EVENT);
    },

    addListener: function(event, callback) {
        this.on(event, callback);
    },

    removeListener: function(event, callback) {
        this.removeListener(event, callback);
    },

    emitSearchClearedEvent: function() {
        this.emit(this.SEARCH_CLEARED_EVENT);
    }
});

AppDispatcher.register(function(action) {
    switch(action.type) {
        case SearchConstants.SEARCH:
            search(action.text);
            break;
        case SearchConstants.CLEAR:
            clear();
            break;
        default:
        // do nothing
    }
});

module.exports = SearchStore;