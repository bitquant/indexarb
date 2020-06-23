var fetch = require('fetchout');

module.exports = async function() {

    try {
        var rsp = await fetch('http://indexarb.com/dividendAnalysis.html', {
            headers: {
                'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:73.0) Gecko/20100101 Firefox/73.0'
            }
        });
    }
    catch(err) {
        throw new Error(`unable to fetch indexarb.com due to error: ${err}`);
    }

    if (rsp.status !== 200) {
        throw new Error(`unable to fetch indexarb.com, status: ${rsp.status}`);
    }

    let result = { };

    let data = await rsp.text();
    let lines = data.split('\n');

    for (let i = 0; i < lines.length; i++) {

        let line = lines[i];

        if (line.match(/<B>S&amp;P<\/B>/)) {
            result['sp500'] = extractIndexData(lines, i, true);
        }
        else if (line.match(/<B>Nasdaq 100<\/B>/)) {
            result['nasdaq100'] = extractIndexData(lines, i, true);
        }
        else if (line.match(/<B>Dow Jones<\/B>/)) {
            result['dowjones'] = extractIndexData(lines, i, false);
        }
        else if (line.match(/Updated:/)) {
            result.updateTime = extractTimestamp(line);
        }
    }

    return result;
}

function extractValue(line) {

    let result = line.match(/<[^>]+><[^>]+>([0-9\.,]+)<[^>]+><[^>]+>/);

    if (result !== null) {
        result = Number(result[1].replace(/,/g, ''));
    }

    return result;
}

function extractIndexData(lines, i, twoLineDescription) {

    if (twoLineDescription) {
        var description = lines[i + 1] + lines[i + 2];
        var aggregateValueLine = lines[i + 3];
        var aggregateDividendsLine = lines[i + 4];
        var dividendYieldLine = lines[i + 5];
    }
    else {
        var description = lines[i + 1];
        var aggregateValueLine = lines[i + 2];
        var aggregateDividendsLine = lines[i + 3];
        var dividendYieldLine = lines[i + 4];
    }

    return {
        totalMarketCap: extractValue(aggregateValueLine),
        totalDividends: extractValue(aggregateDividendsLine),
        dividendYield: extractValue(dividendYieldLine)
    }
}

function extractTimestamp(line) {

    let result = line.match(/<[^>]+><[^>]+>Updated: ([^<]+)<[^>]+>([^<]+)<[^>]+><[^>]+>/);

    if (result !== null) {
        result = result[1] + ' ' + result[2];
    }

    return result;
}
