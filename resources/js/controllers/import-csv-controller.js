/* Import csv controller */
module.exports = function ImportCsvCrlFactory($scope, csvSrv) {
    $scope.file = null;

    $scope.handleInputChange = function (input) {
        const file = input.files[0];
        csvSrv.import(file)
            .then();
    }

};
