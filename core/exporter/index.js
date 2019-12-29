const {AsyncParser} = require('json2csv');

function jsonToCsv(fields = []) {
    return new Promise((resolve, reject) => {
        if (!fields || fields.length) return reject();

        const opts = {
            fields
        };

        const transformOpts = {};

        const asyncParser = new AsyncParser(opts, transformOpts);
        let csv = '';

        asyncParser.processor
            .on('data', chunk => (csv += chunk.toString()))
            .on('end', () => resolve(csv))
            .on('error', () => reject('error'));
    });
}

module.exports = {
    jsonToCsv
};
