module.exports = function ToolbarUserMenuCtrlFactory ($scope) {

    $scope.openMenu = function ($mdMenu, ev) {
        $mdMenu.open(ev);
    };

};
