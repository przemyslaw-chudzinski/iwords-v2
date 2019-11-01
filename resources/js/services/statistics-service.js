/* Statistics service */
class StatisticsService {

    constructor(http) {
        this.http = http;
    }

    fetchExprStatistics() {
        return this.http.get('/api/expressions/statistics');
    }
}

module.exports = function StatisticsSrvFactory($http) {
    return new StatisticsService($http);
};
