const BaseController = require('./base-controller');
const {Expression, ToastBuilder} = require('../classes');

class DialogExpressionIsNotUniqueController extends BaseController {
    constructor($scope, $mdDialog, data) {
        super($scope);

        // setup
        this.$mdDialog = $mdDialog;

        // init state
        this.$scope.chosenExpression = data.chosenExpression;
        this.$scope.existingExpressions = data.res.results.map(res => new Expression(res));

        // assign template functions
        this.$scope.closeSelf = () => this.$mdDialog.hide({canceled: true});
        this.$scope.confirm = () => this.$mdDialog.hide({canceled: false});
    }
}

function DialogExpressionIsNotUniqueFactory(data = {}) {
    return function ($scope, $mdDialog) {
        return new DialogExpressionIsNotUniqueController($scope, $mdDialog, data);
    }
}

class DictionarySearchController extends BaseController {
    constructor($scope, dictionarySrv, expressionSrv, $mdToast, $mdDialog) {
        super($scope);

        // setup
        this.dictionarySrv = dictionarySrv;
        this.expressionSrv = expressionSrv;
        this.$mdToast = $mdToast;
        this.$mdDialog = $mdDialog;

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
     * @param searchText
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

        this.expressionSrv.checkIfExpressionExists({expression: item.expression})
            .then(res => res.data)
            .then(res => {
                if (!res.exists) return this.expressionSrv.addExpression(item.originalExpressionObject)
                    .then(res => {

                        const toastBuilder = new ToastBuilder(this.$mdToast);
                        toastBuilder
                            .setSeverity('success')
                            .addMessage('Wyrażenie zostało dodane')
                            .addCloseButton()
                            .show();

                    })
                    .catch(err => {
                        $event.target.disabled = false;

                        const toastBuilder = new ToastBuilder(this.$mdToast);
                        toastBuilder
                            .setSeverity('error')
                            .addMessage('Wyrażenie nie zostało dodane')
                            .addCloseButton()
                            .show();

                    });

                this._handleWhenExpressionIsNotUnique(res, item);
            });

    }

    _handleWhenExpressionIsNotUnique(res, chosenExpression) {

        const data = {
            res,
            chosenExpression
        };

        this.$mdDialog.show({
            controller: ['$scope', '$mdDialog', DialogExpressionIsNotUniqueFactory(data)],
            templateUrl: '/templates/expr-exists-dialog-tpl.html',
            clickOutsideToClose: true,
            parent: angular.element(document.body)
        })
            .then(({canceled}) =>
                !canceled && this.expressionSrv.addExpression(chosenExpression.originalExpressionObject).then(() => {
                    const toastBuilder = new ToastBuilder(this.$mdToast);
                    toastBuilder
                        .setSeverity('success')
                        .addMessage('Wyrażenie zostało dodane')
                        .addCloseButton()
                        .show();
                }))
            .catch(err => {});
    }
}

module.exports = DictionarySearchController;
