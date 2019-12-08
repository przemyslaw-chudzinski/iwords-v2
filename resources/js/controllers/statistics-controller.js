module.exports = function StatisticsCtrlFactory($scope, statisticsSrv) {

    $scope.data = null;

    statisticsSrv.fetchExprStatistics()
        .then(response => {

            /* Render chart */
            $scope.series = ['Poprawne odpowiedzi', 'Błędne odpowiedzi'];
            $scope.labels = response.data.map(item => item.expression);
            $scope.data = [
                response.data.map(item => item.correctAnswers),
                response.data.map(item => item.incorrectAnswers),
            ];

            $scope.datasetOverride = [{ yAxisID: 'y-axis-1' }, { yAxisID: 'y-axis-2' }];
            $scope.options = {
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

        })
        .catch(err => console.log(err));


};
