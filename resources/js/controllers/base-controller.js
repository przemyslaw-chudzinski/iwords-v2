const scope = new WeakMap();

module.exports = class BaseController {


    constructor($scope) {
        scope.set(this, $scope);
        this.initState();
        this.init();
        this.assignTemplateFunctions();
        this._initControllerHooks();
    }

    get $scope() {
        return scope.get(this);
    }

    /* Init $scope variables */
    initState() {}

    /* Init controller logic */
    init() {}

    /* Assign template functions */
    assignTemplateFunctions() {}

    /* Page Loaded Hook */
    pageLoadedHook() {}

    /* Page Loaded Hook */
    pageContentLoadedHook() {}

    _initControllerHooks() {
        window.addEventListener('load', this.pageLoadedHook.bind(this));
        window.addEventListener('DOMContentLoaded', this.pageContentLoadedHook.bind(this));
    }

};