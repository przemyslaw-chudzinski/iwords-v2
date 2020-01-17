require('./setUp');
const angular = require('angular');
require('angular-aria');
require('angular-animate');
require('angular-messages');
require('angular-material');
require('angular-chart.js');

/* Services */
const ExpressionSrvFactory = require('./services/expression-service');
// const CsvSrvFactory = require('./services/csv-service');
const StatisticsSrvFactory = require('./services/statistics-service');
const LocalStorageSrvFactory = require('./services/local-storage-service');

/* Controllers */
const LearningCtrlFactory = require('./controllers/learning-controller');
// const ImportCsvCrlFactory = require('./controllers/import-csv-controller');
const StatisticsCtrlFactory = require('./controllers/statistics-controller');
const ToolbarUserMenuCtrlFactory = require('./controllers/toolbar-user-menu-controller');
const BodyCrlFactory = require('./controllers/body-controller');
const YourExpressionsCtrlFactory = require('./controllers/your-expressions-controller');

/* Directives */
const ExpressionSentenceTogglerDirFactory = require('./directives/expression-sentence-toggler-directive');

/* Main Module */
const app = angular.module('appModule', ['ngMaterial', 'ngMessages', 'chart.js']);

/* Controllers */
app.controller('LearningCtrl', ['$scope', 'expressionSrv', '$timeout', '$mdDialog', 'localStorageSrv', LearningCtrlFactory]);
// app.controller('ImportCsvCrl', ['$scope', 'csvSrv', ImportCsvCrlFactory]);
app.controller('StatisticsCtrl', ['$scope', 'statisticsSrv', StatisticsCtrlFactory]);
app.controller('ToolbarUserMenuCtrl', ['$scope', ToolbarUserMenuCtrlFactory]);
app.controller('BodyCrl', ['$scope', BodyCrlFactory]);
app.controller('YourExpressionsCtrl', ['$scope', 'expressionSrv', YourExpressionsCtrlFactory]);
/* Services */
app.factory('expressionSrv', ['$http', ExpressionSrvFactory]);
// app.factory('csvSrv', ['$http', CsvSrvFactory]);
app.factory('statisticsSrv', ['$http', StatisticsSrvFactory]);
app.factory('localStorageSrv', [LocalStorageSrvFactory]);
/* Directives */
app.directive('expressionSentenceToggler', ExpressionSentenceTogglerDirFactory);





