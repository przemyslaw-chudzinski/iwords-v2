class SimpleToastController {

    constructor($scope, $mdToast) {
        this.$scope = $scope;
        this.$mdToast = $mdToast;

        // assign template functions
        this.$scope.setToastClass = this._setToastClass.bind(this);
        this.$scope.closeSelf = () => $mdToast.hide();

    }

    _setToastClass() {
        const result = ['basic-toast'];

        switch (this.severity) {
            case 'success':
                result.push('basic-toast--success');
                break;
            case 'warning':
                result.push('basic-toast--warning');
                break;
            case 'error':
                result.push('basic-toast--error');
                break;
        }

        return result.join(' ');
    }

}


class ToastBuilder {

    constructor($mdToast) {
        this._$mdToast = $mdToast;
        this._config = {
            templateUrl: '/toast-templates/toast-template.html',
            locals: {
                icon: null,
                severity: null,
                message: null,
                closeButton: {visible: false, label: 'Zamknij'}
            },
            hideDelay: 4000,
            position: 'top right',
            controller: ['$scope', '$mdToast', SimpleToastController],
            controllerAs: 'ctrl',
            bindToController: true,
        };
    }

    setHideDelay(value) {
        this._config.hideDelay = value;
        return this;
    }

    neverHide() {
        this._config.hideDelay = 0;
        return this;
    }

    setSeverity(value) {

        this._config.locals.severity = value;

        switch (value) {
            case 'success':
                this._config.locals.icon = 'fa fa-check-circle-o fa-2x';
                break;
            case 'warning':
                this._config.locals.icon = 'fa fa-exclamation-triangle fa-2x';
                break;
            case 'error':
                this._config.locals.icon = 'fa fa-frown-o fa-2x';
                break;
        }
        return this;
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

    show() {
        return this._$mdToast.show(this._config);
    }

}

module.exports = ToastBuilder;
