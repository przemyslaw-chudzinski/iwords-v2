const axios = require('axios');
const cherio = require('cherio');

const getDikiSearchUrl = searchText => `https://www.diki.pl/slownik-angielskiego?q=${searchText}`;

class DikiIntegration {

    constructor() {
        this._$ = null;
    }

    async getResults(searchText) {
        try {
            const result = await axios.get(getDikiSearchUrl(searchText));
            this._$ = cherio.load(result.data);
            const dictionaryType = this._detectDictionaryType();
            if (dictionaryType.type === 'en-pl') {
                return this._handleEnIntoPlDictionary();
            }
            return [];
        } catch (e) {

        }
    }

    /**
     * @desc Detects if dictionary is ang->pol
     * @private
     * @return {type: 'en-pl'} | {type: 'pl-en'}
     */
    _detectDictionaryType() {
        const hrefDictionaryType = this._$('a[name="en-pl"]');
        return hrefDictionaryType && hrefDictionaryType.length ? {type: 'en-pl'} : {type: 'pl-en'};
    }

    /**
     * @desc Handles EN->PL dictionary
     * @private
     */
    _handleEnIntoPlDictionary() {
        const mainEntities = this._extractMainEntities();
        const results = [];

        mainEntities.length && mainEntities.each((index, entity) => {
            const res = this._extractDataFromSingleEntityEnIntoPl(entity).reduce((acc, item) => acc.concat(item));
            results.push(res);
        });

        return results.reduce((acc, item) => acc.concat(item));
    }

    _extractMainEntities() {
        return this._$('.diki-results-left-column .dictionaryEntity');
    }

    _extractDataFromSingleEntityEnIntoPl(entity) {
        // determines how many results will be returned from single entity
        const $entity =  this._$(entity);
        const partOfSpeechHeaders = $entity.find('.partOfSpeechSectionHeader');
        const nativeMeanings = $entity.find('ol.foreignToNativeMeanings');
        const results = [];
        const expression = $entity.find('.hws .hw').text().trim();

        // There are headers
        if (partOfSpeechHeaders && partOfSpeechHeaders.length) {

            partOfSpeechHeaders.each((index, header) => {
                const $header = this._$(header);
                const partOfSpeech = $header.find('span.partOfSpeech').text().trim();
                const _results = this._extractNativeMeaningsFromHeader(entity, partOfSpeech, partOfSpeechHeaders.length, nativeMeanings, index);

                const reduced = _results
                    .reduce((acc, item) => acc.concat(item))
                    .map(item => {
                        item.expression = expression;
                        item.partOfSpeech = partOfSpeech;
                        item.provider = 'diki';
                        return item;
                    });

                results.push(reduced);
            });

        } else if (partOfSpeechHeaders && !partOfSpeechHeaders.length && nativeMeanings.length) {

            const _results = this._extractNativeMeaningsFromHeader(entity, null, null, nativeMeanings, null);

            const reduced = _results
                .reduce((acc, item) => acc.concat(item))
                .map(item => {
                    item.expression = expression;
                    item.partOfSpeech = null;
                    item.provider = 'diki';
                    return item;
                });

            results.push(reduced);

        }

        return results;

    }

    _extractNativeMeaningsFromHeader(entity, partOfSpeech, headersCount, nativeMeanings, headerIndex) {
        let results = [];

        // If headersCount === nativeMeanings.length
        // loop by nativeMeanings must be invoke only once
        if (headersCount === nativeMeanings.length) {
            const meanings = this._$(nativeMeanings[headerIndex]).find('li');
            const _results = [];

            meanings.each((_index, meaning) => {
                const res = this._extractDataFromSingleMeaning(meaning);
                res.partOfSpeech = partOfSpeech;
                _results.push(res);
            });

            results.push(_results);

            return results;
        }

        nativeMeanings.each((index, nm) => {
            const $nm = this._$(nm);
            const meanings = $nm.find('li');
            const _results = [];

            meanings.each((_index, meaning) => {
                const res = this._extractDataFromSingleMeaning(meaning);
                res.partOfSpeech = partOfSpeech;
                _results.push(res);
            });

            results.push(_results);

        });

        return results;

    }

    _extractDataFromSingleMeaning(meaning) {
        const $meaning = this._$(meaning);
        const translations = [];
        const exampleSentences = [];

        $meaning.find('span.hw').each((index, translation) => {
            const $translation = this._$(translation);
            translations.push($translation.text().trim());
        });

        $meaning.find('.exampleSentence').each((index, exampleSentence) => {
            const $exampleSentence = this._$(exampleSentence);
            const result = {};

            result.translation = $exampleSentence.find('.exampleSentenceTranslation').text().trim().replace(/\(|\)/g, '');
            result.sentence = $exampleSentence.text().replace(/(\(.*\))/ig, '').trim();

            exampleSentences.push(result);
        });

        return {
            exampleSentences,
            translations
        };
    }

}

module.exports = DikiIntegration;
