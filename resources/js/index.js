require('./setUp');
const angular = require('angular');
require('angular-aria');
require('angular-animate');
require('angular-messages');
require('angular-material');
require('angular-chart.js');
require('./editor');
require('./speech-recognation');

/* Services */
const ExpressionSrvFactory = require('./services/expression-service');
// const CsvSrvFactory = require('./services/csv-service');
const StatisticsSrvFactory = require('./services/statistics-service');
const LocalStorageSrvFactory = require('./services/local-storage-service');
const NotesSrvFactory = require('./services/notes-service');

/* Controllers */
const LearningCtrlFactory = require('./controllers/learning-controller');
// const ImportCsvCrlFactory = require('./controllers/import-csv-controller');
const StatisticsCtrlFactory = require('./controllers/statistics-controller');
const ToolbarUserMenuCtrlFactory = require('./controllers/toolbar-user-menu-controller');
const BodyController = require('./controllers/body-controller');
const YourExpressionsCtrlFactory = require('./controllers/your-expressions-controller');
const EditNoteCtrlFactory = require('./controllers/edit-note-controller');
const ExpressionNotesCtrlFactory = require('./controllers/expression-notes-controller');
const LearningSpeakingCtrlFactory = require('./controllers/learning-speaking-controller');

/* Directives */
const ExpressionSentenceTogglerDirFactory = require('./directives/expression-sentence-toggler-directive');
const AsideNestedMenuTogglerDirFactory = require('./directives/aside-nested-menu-toggler-directive');

/* Main Module */
const app = angular.module('appModule', ['ngMaterial', 'ngMessages', 'chart.js']);

/* Controllers */
app.controller('LearningCtrl', ['$scope', 'expressionSrv', '$timeout', '$mdDialog', 'localStorageSrv', LearningCtrlFactory]);
// app.controller('ImportCsvCrl', ['$scope', 'csvSrv', ImportCsvCrlFactory]);
app.controller('StatisticsCtrl', ['$scope', 'statisticsSrv', StatisticsCtrlFactory]);
app.controller('ToolbarUserMenuCtrl', ['$scope', ToolbarUserMenuCtrlFactory]);
app.controller('BodyCrl', ['$scope', 'localStorageSrv', BodyController]);
app.controller('YourExpressionsCtrl', ['$scope', 'expressionSrv', '$mdDialog', 'notesSrv', '$mdToast', YourExpressionsCtrlFactory]);
app.controller('EditNoteCtrl', ['$scope', 'notesSrv', '$mdToast', EditNoteCtrlFactory]);
app.controller('ExpressionNotesCtrl', ['$scope', 'notesSrv', '$mdDialog', ExpressionNotesCtrlFactory]);
app.controller('LearningSpeakingCtrl', ['$scope', 'expressionSrv', '$timeout', LearningSpeakingCtrlFactory]);
/* Services */
app.factory('expressionSrv', ['$http', ExpressionSrvFactory]);
// app.factory('csvSrv', ['$http', CsvSrvFactory]);
app.factory('statisticsSrv', ['$http', StatisticsSrvFactory]);
app.factory('localStorageSrv', [LocalStorageSrvFactory]);
app.factory('notesSrv', ['$http', NotesSrvFactory]);
/* Directives */
app.directive('expressionSentenceToggler', ExpressionSentenceTogglerDirFactory);
app.directive('asideNestedMenuToggler', AsideNestedMenuTogglerDirFactory);





