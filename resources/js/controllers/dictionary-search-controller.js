const BaseController = require('./base-controller');

class DictionarySearchController extends BaseController {
    constructor($scope, dictionarySrv) {
        super($scope);

        // setup
        this.dictionarySrv = dictionarySrv;

        // init state
        this.$scope.searchText = '';
        this.$scope.isDisabled = false;
        this.$scope.noCache = false;
        this.$scope.selectedItem = null;

        // assign template functions
        this.$scope.searchTextChange = this._searchTextChange.bind(this);
        this.$scope.querySearch = this._querySearch.bind(this);

    }

    /**
     * @desc It handle when search text is changed
     * @param event
     * @private
     */
    _searchTextChange(searchText) {
        console.log(searchText);
    }

    _querySearch(searchText) {
        // return new Promise(resolve => resolve([]));
        return this.dictionarySrv.searchExpressions({searchText});
    }
}

module.exports = DictionarySearchController;
