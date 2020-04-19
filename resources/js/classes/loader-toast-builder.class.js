class LoaderToastController {
    constructor($scope, $mdToast) {
        this.$scope = $scope;
        this.$mdToast = $mdToast;

        this.$scope.closeSelf = () => $mdToast.hide();
    }
}


class LoaderToastBuilder {

    constructor($mdToast) {
        this._$mdToast = $mdToast;
        this._config = {
            templateUrl: '/toast-templates/loader-toast-template.html',
            locals: {
                message: 'Wczytuję...',
                closeButton: {visible: false, label: 'Zamknij'}
            },
            hideDelay: 0,
            position: 'bottom left',
            controller: ['$scope', '$mdToast', LoaderToastController],
            controllerAs: 'ctrl',
            bindToController: true,
        };
    }

    setPosition(position) {
        this._config.position = position;
        return this;
    }

    addMessage(value) {
        this._config.locals.message = value;
        return this;
    }

    addCloseButton(label = 'Zamknij') {
        this._config.locals.closeButton.visible = true;
        this._config.locals.closeButton.label = label;
        return this;
    }

    setHideDelay(value) {
        this._config.hideDelay = value;
        return this;
    }

    show() {
        return this._$mdToast.show(this._config);
    }

}

module.exports = LoaderToastBuilder;
