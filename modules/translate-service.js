var https = require('https');
const args = require('./conf')();

module.exports = function(value, sourceLang, targetLang, callback) {
    var options = null;
    
    if (Array.isArray(value)) {
        var words = [];
        for (var i in value) {
            words.push({
                "api": args.translate_api,
                "keyName": args.translate_key_name,
                "sourceKey": value[i].key,
                "source": value[i].value,
                "sourceLang": sourceLang,
                "targetLang": targetLang
            });
        }
        const postData = JSON.stringify(words);

        options = {
            host: args.translate_host,
            path: '/translate',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "rpc-authorization": args.translate_token,
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(options, (res) => {
            // Buffer the body entirely for processing as a whole.
            var bodyChunks = [];
            res.on('data', function (chunk) {
                // You can process streamed parts here...
                bodyChunks.push(chunk);
            });
            res.on('end', function () {
                var body = Buffer.concat(bodyChunks);
                var data = JSON.parse(body.toString());
                if (data.meta.success && data.result.records.length > 0) {
                    callback(data.result.records);
                } else {
                    callback(null);
                }
            });
        });

        // Write data to request body
        req.write(postData);
        req.end();
    } else {
        options = {
            host: args.translate_host,
            path: `/translate?api=${args.translate_api}&keyName=${args.translate_key_name}&source=${encodeURI(value)}&sourceLang=${sourceLang}&targetLang=${targetLang}`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "rpc-authorization": args.translate_token
            }
        };

        https.get(options, (res) => {
            // Buffer the body entirely for processing as a whole.
            var bodyChunks = [];
            res.on('data', function (chunk) {
                // You can process streamed parts here...
                bodyChunks.push(chunk);
            }).on('end', function () {
                var body = Buffer.concat(bodyChunks);
                var data = JSON.parse(body);
                if (data.meta.success && data.result.records.length > 0) {
                    if (data.meta.msg != 'cache') {
                        console.log(data.meta.msg);
                    }

                    callback(data.result.records[0]);
                } else {
                    callback(null);
                }
            });
        });
    }
}