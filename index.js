var request = require('request');
var cheerio = require('cheerio');

// The URLs for the various lottery games.
var urls = {
  lotto: 'https://igvefur.lotto.is/lottoleikir/urslit/lotto/',
  vikingalotto: 'https://games.lotto.is/lottoleikir/urslit/vikingalotto/',
  eurojackpot: 'https://games.lotto.is/lottoleikir/urslit/eurojackpot/'
};

module.exports.getNumbers = function(callback, type) {
  var params = {url: urls[type]};

  request(params, function(error, res, body) {
    if (error) {
      callback(error);
    }

    if (res.statusCode != 200) {
      callback('Expected HTTP code 200 but got: ' + res.statusCode);
    }

    return callback(null, parseList(body));
  });
};

/*
 * Take the HTML from the lotto page and parse the date from it into JSON
 */
var parseList = function(body) {
  var $ = cheerio.load(body);
  var results = [];
  var tr = $('table').eq(1).find('tr');

  tr.each(function(i) {
    // Skip the first row in the table since the lotto page uses it as a header
    if (i === 0) {
      return;
    }
    var td = $(this).find('td');

    results.push({
      date:  td.eq(0).text().trim(),
      lotto: td.eq(1).html().match(/\d{1,2}/g).map(Number),
      joker: td.eq(2).text().trim().split(' ').map(Number),
      prize: td.eq(3).text().trim(),
      link:  'http://lotto.is' + td.eq(4).find('a').attr('href').trim()
    });
  });

  return results;
};
