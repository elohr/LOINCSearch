var AppDispatcher = require('../dispatcher/AppDispatcher'),
    SearchConstants = require('../constants/SearchConstants');

module.exports = {
    search: function(text) {
        AppDispatcher.dispatch({
            type: SearchConstants.SEARCH,
            text: text
        });
    },
    clear: function() {
        AppDispatcher.dispatch({
            type: SearchConstants.CLEAR
        });
    }
};