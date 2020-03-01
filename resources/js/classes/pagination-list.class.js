class PaginationList {
    constructor(ctx = {}) {
        this._page = ctx.page || 1;
        this._limit = ctx.limit || 5;
        this._total = ctx.total || 0;
        this._pageNumbers = this._calculatePageNumbers();
    }

    get page() {
        return this._page;
    }

    set page(page) {
        this._page = page;
    }

    get limit() {
        return this._limit;
    }

    set limit(limit) {
        this._limit = limit;
        this._pageNumbers = this._calculatePageNumbers();
    }

    get total() {
        return this._total;
    }

    set total(total) {
        this._total = total;
        this._pageNumbers = this._calculatePageNumbers();
    }

    get pageNumbers() {
        return this._pageNumbers;
    }

    nextPage(callback = () => {}) {
        if (this._page < this._pageNumbers) {
            this._page++;
            callback(this._page, this._limit);
        }
    }

    prevPage(callback = () => {}) {
        if (this._page > 1 && this._page <= this._pageNumbers) {
            this._page--;
            callback(this._page, this._limit);
        }
    }

    _calculatePageNumbers() {
        return +Math.ceil(this._total / this._limit);
    }

}

module.exports = PaginationList;
