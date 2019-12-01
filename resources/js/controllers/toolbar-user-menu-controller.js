module.exports = function ToolbarUserMenuCtrlFactory ($scope) {

    $scope.openMenu = function ($mdMenu, ev) {
        console.log('open menu');
        $mdMenu.open(ev);
    };

};
