var utils = require('./utils');

exports.matchs = function(names, line, stopList) {
    var matchs = /\((([\"\'])(.+)[\"\'])\)/gmi.exec(line);
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
            type: 'js'
        };


        console.debug(`${line}`);
        return names;
    }

    matchs = /<(\w+).*>(.+(\{.+\}).+)<\/(\w+)>/gmi.exec(line);
    if(matchs != null && matchs[2]) {
        var match = matchs[2];

        if(utils.isStopWord(match, stopList)) {
            return false; 
        }

        if(matchs[1] != matchs[4]) {
            return false; 
        }

        var name = utils.getName(match, names);
        
        names[name] = {
            match: matchs[2].replace(matchs[3], `${matchs[3].replace(/\./g, '_')}`),
            full_match: matchs[2],
            delimeter: '"',
            line: line,
            value: matchs[3].replace('{', '').replace('}', '').replace(/\./g, '_'),
            arg: matchs[3].replace('{', '').replace('}', ''),
            type: 'svelte_value'
        };

        console.debug(`${line}`);
        return names;
    }

    matchs = /<(\w+).*>(.+)<\/(\w+)>/gmi.exec(line);
    if(matchs != null && matchs[2]) {
        var match = matchs[2];

        if(utils.isStopWord(match, stopList)) {
            return false; 
        }

        if(matchs[1] != matchs[3]) {
            return false; 
        }

        var name = utils.getName(match, names);
        
        names[name] = {
            match: matchs[2],
            full_match: matchs[2],
            delimeter: '"',
            line: line,
            type: 'svelte'
        };

        console.debug(`${line}`);
        return names;
    }

    return false;
}