const BaseController = require('../base-controller');

class LearningSummaryWgtController extends BaseController {
    constructor($scope, statisticsSrv, expressionSrv, $timeout) {
        super($scope);

        // setup
        this.statisticsSrv = statisticsSrv;
        this.expressionSrv = expressionSrv;
        this.$timeout = $timeout;

        // init state
        this.$scope.fetching = true;
        this.$scope.allExprCount = 0;
        this.$scope.basicStats = null;

        // assign template functions

    }

    pageLoadedHook() {
        this._fetchData();
    }

    _fetchData() {
        Promise.all([
            this.statisticsSrv.fetchBasicStatistics(),
            this.expressionSrv.fetchExpressionsCount()
        ])
            .then(([basicStatsRes, exprCountRes]) => {
                this.$scope.basicStats = basicStatsRes.data;
                this.$scope.allExprCount = exprCountRes.data.quantity;
            })
            .catch(err => {})
            .finally(() => {
                this.$timeout(() => {
                    this.$scope.fetching = false;
                });
            });
    }
}

module.exports = LearningSummaryWgtController;
