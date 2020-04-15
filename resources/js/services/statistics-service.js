const ServiceBase = require('./service-base');

/* Statistics service */
class StatisticsService extends ServiceBase {

    constructor(http) {
        super();
        this.http = http;
    }

    fetchExprStatistics() {
        return this.http.get('/api/expressions/statistics', {params: {userId: this.userId}});
    }

    fetchBasicStatistics() {
        return this.http.get('/api/expressions/statistics/basic', {params: {userId: this.userId}});
    }
}

module.exports = function StatisticsSrvFactory($http) {
    return new StatisticsService($http);
};
