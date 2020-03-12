const BaseController = require('./base-controller');
const {Expression} = require('../classes');

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
        return this.dictionarySrv.searchExpressions({searchText})
            .then(res => res.data || [])
            .then(data => data.map(item => new Expression(item)));
    }
}

module.exports = DictionarySearchController;
