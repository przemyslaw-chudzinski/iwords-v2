/* Csv service */
class CsvService {
    constructor(http) {
        this.http = http;
    }

    import(file) {
        const formData = new FormData();
        formData.append('csv', file);
        formData.append('name', 'John');
        return this.http.post('/api/expressions/import', formData, {headers: {'Content-Type': undefined}});
    }
}

module.exports = function CsvSrv($http) {
    return new CsvService($http);
};
