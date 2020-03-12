const BaseController = require('./base-controller');
const {Expression} = require('../classes');

class DictionarySearchController extends BaseController {
    constructor($scope, dictionarySrv, expressionSrv, $mdToast) {
        super($scope);

        // setup
        this.dictionarySrv = dictionarySrv;
        this.expressionSrv = expressionSrv;
        this.$mdToast = $mdToast;

        // init state
        this.$scope.searchText = '';
        this.$scope.isDisabled = false;
        this.$scope.noCache = false;
        this.$scope.selectedItem = null;

        // assign template functions
        this.$scope.searchTextChange = this._searchTextChange.bind(this);
        this.$scope.querySearch = this._querySearch.bind(this);
        this.$scope.handleAddToIwords = this._handleAddToIwords.bind(this);

    }

    /**
     * @desc It handle when search text is changed
     * @param event
     * @private
     */
    _searchTextChange(searchText) {

    }

    _querySearch(searchText) {
        return this.dictionarySrv.searchExpressions({searchText})
            .then(res => res.data || [])
            .then(data => data.map(item => new Expression(item)));
    }

    _handleAddToIwords(item, $event) {
        $event.stopPropagation();
        console.log(item, $event);
        $event.target.disabled = true;
        this.expressionSrv.addExpression(item.originalExpressionObject)
            .then(res => this._handleAddToIwordsSuccess(res))
            .catch(err => {
                $event.target.disabled = false;
            });
    }

    _handleAddToIwordsSuccess(res) {
        this.$mdToast.show(
            this.$mdToast.simple()
                .textContent('Simple Toast!')
                .hideDelay(3000)
                .position('bottom left')
        );
    }
}

module.exports = DictionarySearchController;
