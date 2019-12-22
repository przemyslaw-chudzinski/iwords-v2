/* Body controller */
module.exports = function BodyCrlFactory($scope) {

    initAside();

    $scope.toggleAside = function () {
        $scope.asideOpened = !$scope.asideOpened;
        $scope.asideOpened ? localStorage.setItem('asideOpened', '1') : localStorage.removeItem('asideOpened');
    };

    function initAside() {
        $scope.asideOpened = localStorage.getItem('asideOpened') === '1';
    }

};
