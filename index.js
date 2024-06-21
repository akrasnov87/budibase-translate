const args = require('./modules/conf')();

const utils = require('./modules/utils');

var fs = require('fs');
var pth = require('path');
var join = pth.join;

var svelteMatchs = require('./modules/svelte-matchs');
var jsMatchs = require('./modules/js-matchs');

var stopList = fs.existsSync(join(__dirname, 'stop.list')) ? fs.readFileSync(join(__dirname, 'stop.list')).toString().split('\n') : [];

if(args.file) {
    var matchCount = 0;
    var names = {};

    args.format = args.format || pth.extname(args.file).replace('.', '');

    // загружаем ранее созданные строки
    var outputDir = args.output_locale ? args.output_locale : __dirname;
    if(!fs.existsSync(outputDir)) {
        return console.log(`Выходной каталог ${outputDir} не найден.`)
    }

    if(fs.existsSync(join(outputDir, 'en.json'))) {
        names = JSON.parse(fs.readFileSync(join(outputDir, 'en.json')).toString());
    }

    var lock = {};

    var lines = fs.readFileSync(args.file).toString().split('\n');

    if(lines[0].indexOf('translate-badibase') >= 0) {
        console.log(`Файл ${args.file} пропущен`)
        return;
    }

    for(var idx in lines) {
        var line = lines[idx];

        if(typeof line != 'string') {
            continue;
        }

        if(line.indexOf('bt-ignore') >= 0) {
            continue;
        }

        if(lock[line] == true) {
            continue;
        }

        if(args.format == 'svelte') {
            var responseData = svelteMatchs.matchs(names, line, stopList);
            if(responseData != false) {
                names = responseData;
                matchCount++;
                lock[line] = true;
                continue;
            }
        }

        if(args.format == 'ts') {
            var responseData = jsMatchs.matchs(names, line, stopList);
            if(responseData != false) {
                names = responseData;
                matchCount++;
                lock[line] = true;
                continue;
            }
        }
    }

    if(matchCount == 0) {
        return console.log('Результатов не найдено.');
    }

    var response = {};

    args.prefix = args.file.replace(args.path_clear, '').toLowerCase().replace(pth.extname(args.file), '').replace(/\//g, '.') + '.'

    var prefix = args.prefix || '';

    for(var name in names) {
        response[prefix + name] = names[name].match; 
    }

    var lines = fs.readFileSync(args.file).toString().split('\n');
    for(var idx in lines) {   
        var line = lines[idx];

        for(var name in names) {
            if(line == names[name].line) {
                var delimeter = names[name].delimeter;
                switch(names[name].type) {
                    case 'svelte':
                        lines[idx] = names[name].line.replace(names[name].full_match, `{$_(${delimeter}${prefix + name}${delimeter})}`) + `\t<!-- ${names[name].line.trim()} -->`;
                        break;

                    case 'svelte_value':
                        lines[idx] = names[name].line.replace(names[name].full_match, `{$_(${delimeter}${prefix + name}${delimeter}, { values: {${names[name].value}:${names[name].arg}}})}`) + `\t<!-- ${names[name].line.trim()} -->`
                        break;

                    case 'ts_value':
                        lines[idx] = names[name].line.replace(names[name].full_match, `i18n.__(${delimeter}${prefix + name}${delimeter}, ${names[name].arg})`) + `\t// ${names[name].line.trim()}`
                        break;

                    case 'ts':
                        lines[idx] = names[name].line.replace(names[name].full_match, `i18n.__(${delimeter}${prefix + name}${delimeter})`) + `\t// ${names[name].line.trim()}`
                        break;

                    default:
                        lines[idx] = names[name].line.replace(names[name].full_match, `$_(${delimeter}${prefix + name}${delimeter})`) + `\t// ${names[name].line.trim()}`
                        break;
                }
            }
        }
    }

    if(args.format == 'svelte') {
        lines.insert(0, '<!-- translate-badibase -->');
        lines.insert(2, '  import { _ } from "svelte-i18n"');
    }

    if(args.format == 'ts') {
        lines.insert(0, '// translate-badibase ');
        lines.insert(2, 'const i18n = require("i18n")');
    }

    var filePath = join(outputDir, 'en.json');

    if(fs.existsSync(filePath)) {
        // нужно добавить новые элементы

        var items = JSON.parse(fs.readFileSync(filePath).toString())

        for(var item in response) {
            items[item] = response[item];
        }

        fs.writeFileSync(filePath, JSON.stringify(items, null, '\t'));
    } else {
        fs.writeFileSync(filePath, JSON.stringify(response, null, '\t'));
    }

    console.log(`Файл ${filePath} сохранён.`);

    function translateFunction(callback) {
        if(args.translate_target) {
            var filePathTr = join(outputDir,  `${args.translate_target}.json`);
    
            utils.translate(filePathTr, response, () => {
                callback();
            })
        } else {
            callback();
        }
    }

    translateFunction(() => {
        args.output_file = args.output_file ? join(args.output_file, pth.basename(args.file)) : args.file

        fs.writeFileSync(args.output_file, lines.join('\n'));
        console.log(`Файл ${args.output_file} сохранён.`);
    });
} else {
    console.log(`Файл ${file} не найден.`)
}