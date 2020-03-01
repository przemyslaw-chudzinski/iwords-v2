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

        // assign template functions
        $scope.toggleAside = this._toggleAside.bind(this);
    }

    _toggleAside() {
        this.$scope.asideOpened = !this.$scope.asideOpened;
        this.$scope.asideOpened ? this._localStorageSrv.asideOpened() : this._localStorageSrv.asideClosed();
    }

}

module.exports = BodyController;
