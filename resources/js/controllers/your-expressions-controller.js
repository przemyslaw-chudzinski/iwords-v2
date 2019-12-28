module.exports = function YourExpressionsCtrlFactory ($scope) {

    /* Opens list menu options */
    $scope.openMenu = function ($mdMenu, ev) {
        $mdMenu.open(ev);
    };

};
