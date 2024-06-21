const translateService = require('./translate-service');
const args = require('./conf')();
var fs = require('fs');
var pth = require('path');
var join = pth.join;

Array.prototype.insert = function ( index, ...items ) {
    this.splice( index, 0, ...items );
};

function toVariableName(str, len) {

    len = len || 1;

    var name = str.toLowerCase();

    var re = /\w+/gi;
    var names = [];

    var match;
    while (match = re.exec(name)) {
        names.push(match[0]);
    }

    return names.splice(0, len).join('_');
}

function toVariableLen(str) {

    var name = str.toLowerCase();

    var re = /\w+/gi;
    var names = [];

    var match;
    while (match = re.exec(name)) {
        names.push(match[0]);
    }

    return names.length;
}

exports.toVariableName = toVariableName

exports.isStopWord = function(str, list) {
    return list.filter((i) => { 
        return str.toLowerCase() == i 
    }).length > 0;
}

exports.getName = function(match, names) {
    var len = 1;
    var name = toVariableName(match, len);

    while(names[name]) {
        len++;
        if(toVariableLen(match) < len) {
            match = match + " " + len;
        }
        name = toVariableName(match, len)
    }
    return name;
}

exports.translate = function(filePath, response, callback) {

    var toArray = [];
    for(var item in response) {
        toArray.push({ key: item, value: response[item] });
    }

    translateService(toArray, 'en', args.translate_target, (res)=> {
        var trResponse = {};
        for(var idx in res) {
            var item = res[idx];
            trResponse[item.sourceKey] = item.target;
        }

        if(fs.existsSync(filePath)) {
            // нужно добавить новые элементы
    
            var items = JSON.parse(fs.readFileSync(filePath).toString())
    
            for(var item in trResponse) {
                items[item] = trResponse[item];
            }
            fs.writeFileSync(filePath, JSON.stringify(items, null, '\t'));
        } else {
            fs.writeFileSync(filePath, JSON.stringify(trResponse, null, '\t'));
        }

        callback();
    });
}