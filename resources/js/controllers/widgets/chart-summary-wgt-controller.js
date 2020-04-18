const BaseController = require('../base-controller');

class ChartSummaryWgtController extends BaseController {
    constructor($scope, statisticsSrv, $timeout) {
        super($scope);

        // setup
        this.statisticsSrv = statisticsSrv;
        this.$timeout = $timeout;

        // init state
        this.$scope.fetching = true;
        this.$scope.fetchingError = false;
        this.$scope.data = null;

        // assign template functions
        this.$scope.refresh = () => this._fetchData();

    }

    pageLoadedHook() {
        this._fetchData();
    }

    _fetchData() {

        this.$scope.fetching = true;
        this.$scope.fetchingError = false;

        this.statisticsSrv.fetchExprStatistics()
            .then(response => {
                //
                // this.$scope.expressionsCount = response.data.length;

                /* Render chart */
                this.$scope.series = ['Poprawne odpowiedzi', 'Błędne odpowiedzi'];
                this.$scope.labels = response.data.map(item => item.expression);
                this.$scope.data = [
                    response.data.map(item => item.correctAnswers),
                    response.data.map(item => item.incorrectAnswers),
                ];

                this.$scope.datasetOverride = [{ yAxisID: 'y-axis-1' }, { yAxisID: 'y-axis-2' }];
                this.$scope.options = {
                    scales: {
                        yAxes: [
                            {
                                id: 'y-axis-1',
                                type: 'linear',
                                display: true,
                                position: 'left'
                            },
                            {
                                id: 'y-axis-2',
                                type: 'linear',
                                display: true,
                                position: 'right'
                            }
                        ]
                    }
                };

                this.$scope.fetching = false;

            })
            .catch(err => {
                this.$scope.fetchingError = true;
                this.$scope.fetching = false;
            });

    }
}

module.exports = ChartSummaryWgtController;
