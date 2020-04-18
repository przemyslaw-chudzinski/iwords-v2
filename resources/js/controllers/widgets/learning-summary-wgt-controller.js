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
        this.$scope.fetchingError = false;

        // assign template functions
        this.$scope.refresh = () => this._fetchData();

    }

    pageLoadedHook() {
        this._fetchData();
    }

    _fetchData() {

        this.$scope.fetching = true;
        this.$scope.fetchingError = false;

        Promise.all([
            this.statisticsSrv.fetchBasicStatistics(),
            this.expressionSrv.fetchExpressionsCount()
        ])
            .then(([basicStatsRes, exprCountRes]) => {
                this.$scope.basicStats = basicStatsRes.data;
                this.$scope.allExprCount = exprCountRes.data.quantity;
            })
            .catch(this._handleFetchingDataError.bind(this))
            .finally(() => {
                this.$timeout(() => {
                    this.$scope.fetching = false;
                });
            });
    }

    _handleFetchingDataError(error) {
        this.$scope.fetchingError = true;
    }
}

module.exports = LearningSummaryWgtController;
