'use strict';

const Translator = require('../components/translator.js');

module.exports = function (app) {
  
  const translator = new Translator();

  app.route('/api/translate')
    .post((req, res) => {
      let {text, locale} = req.body;
      if(text == undefined || !locale) {
        return res.json({error: 'Required field(s) missing'})
      }

      if(text == '') {
        return res.json({error: 'No text to translate'})
      }

      let translation = '';

      if(locale == 'american-to-british')
        translation = translator.toBritishEnglish(text);
      else if(locale == 'british-to-american')
        translation = translator.toAmericanEnglish(text);
      else
      return res.json({error: 'Invalid value for locale field'})

      if(translation == text || !translation) 
        return res.json({text: text, translation: 'Everything looks good to me!'})

      else
        return res.json({text: text, translation: translation[1]})
    });
};
