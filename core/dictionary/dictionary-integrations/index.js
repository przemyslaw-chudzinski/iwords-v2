const DikiIntegration = require('./diki');

class DictionaryContentExtractor {

    static async extract(searchText, provider = 'diki') {
        switch (provider) {
            case "diki": {
                const diki = new DikiIntegration();
                return await diki.getResults(searchText);
            }
        }
    }

}

module.exports = DictionaryContentExtractor;
