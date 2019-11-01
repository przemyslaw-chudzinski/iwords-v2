module.exports = function LearningCtrlFactory ($scope, expressionSrv, $timeout) {
    // $scope.currentExpr = {expression: null, translations: []};
    $scope.currentExprs = [];
    $scope.currentExpr = null;
    $scope.answer = '';
    $scope.answerSuccess = false;
    $scope.answerWrong = false;
    $scope.skipping = false;

    const inputElem = document.querySelector('.input');

    inputElem && inputElem.focus();

    // expressionSrv.fetchExpression()
    //     .then(({data}) => ($scope.currentExpr = data));

    expressionSrv.fetchExpressions()
        .then(({data}) => {
            $scope.currentExprs = data;
            if (data && data.length) {
                $scope.currentExpr = data[0];
            }
        });

    $scope.handleKeyPress = function ({keyCode}) {
        if (keyCode === 13) {
            if (inputElem) {
                inputElem.disabled = true;
            }
            $scope.answer === $scope.currentExpr.expression ?
                handleCorrectAnswer() :
                handleIncorrectAnswer();
        }
    };

    $scope.skipExpression = function () {
        $scope.skipping = true;
        fetchNextWord(err => {
            if (err) {
                /* Handle error */
                return;
            }
            $scope.answer = '';
            $scope.answerSuccess = false;
            $scope.skipping = false;
            if (inputElem) {
                inputElem.disabled = false;
                inputElem.focus();
            }
        }, false);
    };

    function handleCorrectAnswer() {
        $scope.answerSuccess = true;

        /* Remove expression from stack */
        $scope.currentExprs = $scope.currentExprs.filter(expr => expr._id !== $scope.currentExpr._id);

        $timeout(() => {

            if ($scope.currentExprs.length) {

                expressionSrv.incrementAnswersCounter($scope.currentExpr._id, true)
                    .then(() => {
                        $scope.answer = '';
                        $scope.answerSuccess = false;
                        $scope.currentExpr = $scope.currentExprs[0];
                        if (inputElem) {
                            inputElem.disabled = false;
                            inputElem.focus();
                        }
                    })
                    .catch(err => console.log('something went wrong', err));

            } else {
                /* Fetch next new word */
                fetchNextWord(err => {
                    if (err) {
                        /* Handle error */
                        return;
                    }

                    $scope.answer = '';
                    $scope.answerSuccess = false;
                    if (inputElem) {
                        inputElem.disabled = false;
                        inputElem.focus();
                    }
                });
            }

        }, 2000);
    }

    function handleIncorrectAnswer() {
        $scope.answerWrong = true;

        $timeout(function () {

            expressionSrv.incrementAnswersCounter($scope.currentExpr._id, false)
                .then(() => {
                    $scope.answerWrong = false;
                    $scope.answer = '';
                    if (inputElem) {
                        inputElem.disabled = false;
                        inputElem.focus();
                    }
                })
                .catch(err => console.log('something went wrong', err));

        }, 2000);

    }

    function fetchNextWord(next = () => {}, correct = true) {
        expressionSrv.incrementAnswersCounter($scope.currentExpr._id, correct)
            .then(() => expressionSrv.fetchExpressions()
                .then(({data}) => {
                    $scope.currentExprs = data;
                    if (data && data.length) {
                        $scope.currentExpr = data[0];
                    }
                    next(null);
                }))
            .catch(err => console.log('something went wrong', err));
    }
};
