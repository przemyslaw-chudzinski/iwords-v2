const defaultPagination = {
    page: 1,
    limit: 30
};

module.exports = superclass => {


    return class extends superclass {

        initState() {
            super.initState();
            this.$scope.pagination = {
                ...defaultPagination,
            };
            this.$scope.prevPageDisable = true;
            this.$scope.nextPageDisable = true;
        }

        assignTemplateFunctions() {
            super.assignTemplateFunctions();
            this.$scope.nextPage = this._nextPage.bind(this);
            this.$scope.prevPage = this._prevPage.bind(this);
        }

        get pagination() {
            return this.$scope.pagination;
        }

        _nextPage() {
            this.$scope.pagination.page++;
            if (this.onNextPage && typeof this.onNextPage === 'function') {
                this.onNextPage(this.pagination);
            }
        }

        _prevPage() {
            this.$scope.pagination.page--;
            if (this.onPrevPage && typeof this.onPrevPage === 'function') {
                this.onPrevPage(this.pagination);
            }
        }

        resetPagination() {
            this.$scope.pagination = {
                ...defaultPagination
            };
        }

        calculateMaxPageNumber(total) {
            return +Math.ceil(total / this.pagination.limit);
        }

    };

};
