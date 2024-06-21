var utils = require('./utils');

exports.matchs = function(names, line, stopList) {
    var matchs = /\(*(([\"\'])(.+)[\"\'])\)*/gmi.exec(line);
    if(matchs != null && matchs[3] && (matchs[0].indexOf(')') >= 0 || matchs[0].indexOf('(') >= 0)) {
        var match = matchs[3];

        if(utils.isStopWord(match, stopList)) {
            return false;
        }

        if(match.indexOf('./') >= 0) {
            return false;
        }

        var name = utils.getName(match, names);
        
        names[name] = {
            match: matchs[3],
            full_match: matchs[1],
            delimeter: matchs[2],
            line: line,
            type: 'ts'
        };

        console.debug(`${line}`);
        return names;
    }

    matchs = /\w+:\s*(([\"\'])(.+)[\"\'])/gmi.exec(line);
    if(matchs != null && matchs[3]) {
        var match = matchs[3];

        if(utils.isStopWord(match, stopList)) {
            return false;
        }

        if(match.indexOf('./') >= 0) {
            return false;
        }

        var name = utils.getName(match, names);
        
        names[name] = {
            match: matchs[3],
            full_match: matchs[1],
            delimeter: matchs[2],
            line: line,
            type: 'ts'
        };

        console.debug(`${line}`);
        return names;
    }

    matchs = /(['"`])(.+(\{.+\}).+)(['"`])/gmi.exec(line);
    if(matchs != null && matchs[2]) {
        var match = matchs[2];

        if(utils.isStopWord(match, stopList)) {
            return false;
        }

        var name = utils.getName(match, names);
        
        names[name] = {
            match: matchs[2].replace(`$${matchs[3]}`, '%s'),
            full_match: matchs[0],
            delimeter: '"',
            line: line,
            value: matchs[3].replace('{', '').replace('}', '').replace(/\./g, '_'),
            arg: matchs[3].replace('{', '').replace('}', ''),
            type: 'ts_value'
        };

        console.debug(`${line}`);
        return names;
    }

    return false;
}