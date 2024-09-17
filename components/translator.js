const americanOnly = require('./american-only.js');
const americanToBritishSpelling = require('./american-to-british-spelling.js');
const americanToBritishTitles = require("./american-to-british-titles.js")
const britishOnly = require('./british-only.js')

let reverse = obj => {
    return Object.assign(
        {},
        ...Object.entries(obj).map(([key, value]) => ({
            [value] : key
        }))
    )
}

class Translator {
    toAmericanEnglish(text) {
        let dict = {...britishOnly, ...reverse(americanToBritishSpelling)};
        let titles = reverse(americanToBritishTitles);
        let regex  = /([1-9]|1[012]).[0-5][0-9]/g;
        let translation = this.translate(
            text, 
            dict,
            titles,
            regex,
            'toAmerican',
        );

        if(!translation)
            return text;

        return translation;
    }
    toBritishEnglish(text) {
        let dict = {...americanOnly, ...americanToBritishSpelling};
        let titles = americanToBritishTitles;
        let regex  = /([1-9]|1[012]):[0-5][0-9]/g;
        let translation = this.translate(
            text, 
            dict,
            titles,
            regex,
            'toBritish  ',
        );

        if(!translation)
            return text;

        return translation;
    }

    translate(text, dict, titles, regex, locale) {
        let lowerText = text.toLowerCase();
        let matchesObj = {};

        //Search for titles and add them to the obj
        Object.entries(titles).map(([key, value]) => {
            if(lowerText.includes(key))
                matchesObj[key] = value.charAt(0).toUpperCase() + value.slice(1);
        });

        //Filter words with spaces in dict
        let wordsWithSpace = 
            Object.fromEntries(
                Object.entries(dict).filter(([key, value]) => key.includes(" "))
            );

        //Search for words with spaces that matches the word in text and add them to the obj
        Object.entries(wordsWithSpace).map(([key, value]) => {
            if(lowerText.includes(key))
                matchesObj[key] = value;
        })

        //Search for single words that matches the word in text and add them to the obj
        lowerText.match(/(\w+([-'])(\w+)?[-']?(\w+))|\w+/g).forEach(word => {
            if(dict[word])
                matchesObj[word] = dict[word];
        })

        let matchedTime = lowerText.match(regex)
        //Search for time matches and add them to the obj
        if(matchedTime) {
            matchedTime.map(time => {
                if(locale === 'toAmerican')
                    return matchesObj[time] = time.replace('.', ':')

                return matchesObj[time] = time.replace(':', '.')
            })
        }

        //No match
        if(Object.keys(matchesObj).length === 0)
            return null;

        let translatedWord = this.replaceAll(text, matchesObj)
        let highlightTranslatedWord = this.highlightReplaceAll(text, matchesObj)

        return [translatedWord, highlightTranslatedWord];
    }

        replaceAll(text, matchesObj) {
            let replica = new RegExp(Object.keys(matchesObj).join('|'), 'gi');
            return text.replace(replica, (matched) => matchesObj[matched.toLowerCase()]);
        }

        highlightReplaceAll(text, matchesObj) {
            let replica = new RegExp(Object.keys(matchesObj).join('|'), 'gi');
            return text.replace(replica, (matched) => {
                return `<span class="highlight"> ${matchesObj[matched.toLowerCase()]}</span>`
            });
        }

}

module.exports = Translator;