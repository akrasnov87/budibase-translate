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