module.exports = function LearningCtrlFactory ($scope, expressionSrv, $timeout, $mdDialog) {
    $scope.currentExprs = [];
    $scope.currentExpr = null;
    $scope.answer = '';
    $scope.answerSuccess = false;
    $scope.answerWrong = false;
    $scope.skipping = false;
    $scope.repeatCount = 0;
    $scope.repeatState = {
        state: false
    };

    const inputElem = document.querySelector('.input');

    inputElem && inputElem.focus();

    /* Init  */

    if (!('localStorage' in window)) {
        throw new Error('local storage is not supported');
    }

    const onlyRepeats = localStorage.getItem('onlyRepeats');

    if (onlyRepeats) {
        $scope.repeatState = {state: true};
    }

    expressionSrv.fetchExpressions(!!onlyRepeats)
        .then(({data: {data}}) => {
            $scope.currentExprs = data;
            if (data && data.length) {
                $scope.currentExpr = {
                    ...data[0],
                    refs: {
                        diki: `https://www.diki.pl/slownik-angielskiego?q=${data[0].expression}`
                    }
                };

            }
        });

    fetchRepeatCount();

    /* ************************************************** */

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

        /* Save to ls */
        if ($scope.repeatState.state) {
            localStorage.setItem('onlyRepeats', $scope.repeatState.state);
        } else {
            localStorage.removeItem('onlyRepeats');
        }


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
        }, false, $scope.repeatState.state);
    };

    $scope.hasExampleSentences = function () {
        return $scope.currentExpr && $scope.currentExpr.exampleSentences && $scope.currentExpr.exampleSentences.length;
    };

    /* Open menu */
    $scope.openMenu = function ($mdMenu, event) {
        $mdMenu.open(event);
    };

    /* Reset repeat mode */
    $scope.resetRepeatMode = function () {
        console.log('resetRepeatMode');
        $scope.confirmResetRepeatMode()
            .then(function () {
                console.log('confirm');
            }, function () {
                console.log('reject');
            });
    };

    /* Show expressions in repeat mode */
    $scope.showExpressionsInRepeatMode = function (event) {
        console.log('showExpressionsInRepeatMode');
    };

    $scope.confirmResetRepeatMode = function () {
        const confirm = $mdDialog.confirm()
            .title('Czy na pewno chcesz zresetować tryb powtórek?')
            .textContent('Jeśli zresetujesz tryb powtórek, wszystkie wyrażenia z powtórek zostaną usunięte')
            .targetEvent(event)
            .ok('Tak, chcę zrestować powtórki')
            .cancel('Anuluj');

        return $mdDialog.show(confirm);
    };

    function handleCorrectAnswer() {
        $scope.answerSuccess = true;

        console.log('correct');

        /* Remove expression from stack */
        $scope.currentExprs = $scope.currentExprs.filter(expr => expr._id !== $scope.currentExpr._id);

        $timeout(() => {

            if ($scope.currentExprs.length) {

                expressionSrv.incrementAnswersCounter($scope.currentExpr._id, true)
                    .then(() => {

                        /* Update repeat counter */
                        fetchRepeatCount();

                        $scope.answer = '';
                        $scope.answerSuccess = false;
                        $scope.currentExpr = $scope.currentExprs[0];
                        $scope.currentExpr = $scope.currentExpr = {
                            ...$scope.currentExprs[0],
                            refs: {
                                diki: `https://www.diki.pl/slownik-angielskiego?q=${$scope.currentExprs[0].expression}`
                            }
                        };
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
                }, true, $scope.repeatState.state);
            }

        }, 2000);
    }

    // $scope.toggleSentenceTranslationVisibility = function (sentenceId) {
    //     console.log(sentenceId);
    // };

    function handleIncorrectAnswer() {
        $scope.answerWrong = true;

        $timeout(function () {

            expressionSrv.incrementAnswersCounter($scope.currentExpr._id, false)
                .then(() => {

                    /* Update repeat counter */
                    fetchRepeatCount();

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

    function fetchNextWord(next = () => {}, correct = true, onlyRepeats = false) {
        expressionSrv.incrementAnswersCounter($scope.currentExpr._id, correct, onlyRepeats)
            .then(() => expressionSrv.fetchExpressions(onlyRepeats)
                .then(({data: {data}}) => {
                    $scope.currentExprs = data;
                    if (data && data.length) {
                        $scope.currentExpr = {
                            ...data[0],
                            refs: {
                                diki: `https://www.diki.pl/slownik-angielskiego?q=${data[0].expression}`
                            }
                        };
                    }
                    next(null);
                }))
            .catch(err => console.log('something went wrong', err));
    }

    function fetchRepeatCount() {
        expressionSrv.fetchRepeatCount()
            .then(({data: {repeatCount}}) => {
                $scope.repeatCount = repeatCount;
            })
            .catch(err => {
                $scope.repeatCount = 0;
                console.log('something went wrong', err);
            });
    }
};
