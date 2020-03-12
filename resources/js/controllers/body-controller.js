const BaseController = require('./base-controller');

/**
 * Body Controller attached to the body tag
 */
class BodyController extends BaseController {

    constructor($scope, localStorageSrv) {
        super($scope);

        // setup
        this._localStorageSrv = localStorageSrv;

        // init state
        $scope.asideOpened = localStorageSrv.asideIsOpened();
        $scope.asideOpened ? localStorageSrv.asideOpened() : localStorageSrv.asideClosed();
        $scope.dictionaryAutocompleteFocused = false;

        // assign template functions
        $scope.toggleAside = this._toggleAside.bind(this);
        $scope.dictionaryAutocompleteFocus = this._dictionaryAutocompleteFocus.bind(this);
        $scope.dictionaryAutocompleteBlur = this._dictionaryAutocompleteBlur.bind(this);
    }

    _toggleAside() {
        this.$scope.asideOpened = !this.$scope.asideOpened;
        this.$scope.asideOpened ? this._localStorageSrv.asideOpened() : this._localStorageSrv.asideClosed();
    }

    _dictionaryAutocompleteFocus() {
        this.$scope.dictionaryAutocompleteFocused = true;
    }

    _dictionaryAutocompleteBlur() {
        this.$scope.dictionaryAutocompleteFocused = false;
    }

}

module.exports = BodyController;
