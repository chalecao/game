/**
 * a barebones HTTP server in JS
 */

var port = 8888,
    http = require('http'),
    urlParser = require('url'),
    fs = require('fs'),
    path = require('path'),
    // __dirname 获取的是当前软件的路径，是内置变量；process.cwd()获取的是当前命令行目录
    currentDir = process.cwd();

import journey from 'journey';
import {
    resolve,
    dirname,
    join
} from "path";

// Create a Router
//
var router = new(journey.Router);
router.map(function () {
    this.get(/^ajax\/(.*)$/).bind(function (req, response, id, data) {
        if (id == "game.json") {
            let files = fs.readdirSync(join(currentDir, "roms"));
            var _games = {
                "其他": []
            };
            let type = "其他";
            files.forEach(function (item) {
                if (item.match("-")) {
                    type = item.split("-")[0];
                    if (!_games[type]) {
                        _games[type] = [];
                    }
                    _games[type].push([
                        item.split("-")[1].split(".")[0], 'roms/' + item
                    ])
                } else {
                    _games["其他"].push([
                        item.split(".")[0], 'roms/' + item
                    ])
                }
            });
            response.send(200, {}, _games)
        }
    });
});

function cleanData(obj) {
    return obj.replace(/ /g, "").replace(/\/\/[\s\S]*?\r/g, "").replace(/\n/g, "").replace(/\r/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
}

function exec(cmdStr, _cb) {
    var exec = require('child_process').exec;
    exec(cmdStr, function (err, stdout, stderr) {
        _cb && _cb();
    });
}

function handleRequest(request, response) {

    var urlObject = urlParser.parse(request.url, true);
    var pathname = decodeURIComponent(urlObject.pathname);
    console.log('[' + (new Date()).toUTCString() + '] ' + '"' + request.method + ' ' + pathname + '"');
    if (/(api|ajax)/g.test(pathname)) {
        var body = "";
        request.addListener('data', function (chunk) {
            body += chunk
        });
        request.addListener('end', function () {
            //
            // Dispatch the request to the router
            //
            router.handle(request, body, function (result) {
                // response.writeHead(result.status, result.headers);
                response.writeHead(200, {
                    'Content-Type': 'application/json'
                });
                response.end(result.body);
            });
        });

    } else {
        var filePath = "";
        if (pathname.indexOf("cmpApp") >= 0) {
            // currentDir = __dirname;
            // console.log(__dirname);
            // console.log(pathname);
            var _subPath = pathname.substr(pathname.indexOf("cmpApp") + 6);
            // console.log(_subPath);
            //静态文件处理
            // filePath = path.join(__dirname, "../static" + (_subPath == "/" ? "/index.html" : _subPath));
            filePath = join(__dirname, ".." + _subPath);
        } else {
            //静态文件处理
            filePath = join(currentDir, pathname);
        }
        fs.stat(filePath, function (err, stats) {
            if (err) {
                response.writeHead(404, {});
                response.end('File not found!');
                return;
            }
            console.log(stats.isDirectory());
            if (stats.isFile()) {
                fs.readFile(filePath, function (err, data) {
                    if (err) {
                        response.writeHead(404, {});
                        response.end('Opps. Resource not found');
                        return;
                    }

                    if (filePath.indexOf("svg") > 0) {
                        response.writeHead(200, {
                            'Content-Type': 'image/svg+xml; charset=utf-8'
                        });
                    } else {
                        response.writeHead(200, {
                            "Access-Control-Allow-Origin": "*",
                            "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
                            "Access-Control-Allow-Methods": "PUT,POST,GET,DELETE,OPTIONS"
                        });
                    }
                    response.write(data);
                    response.end();
                });

            } else if (stats.isDirectory()) {
                fs.readdir(filePath, function (error, files) {
                    if (error) {
                        response.writeHead(500, {});
                        response.end();
                        return;
                    }
                    var l = pathname.length;
                    if (pathname.substring(l - 1) != '/') pathname += '/';


                    response.writeHead(200, {
                        'Content-Type': 'text/html'
                    });
                    response.write('<!DOCTYPE html>\n<html><head><meta charset="UTF-8"><title>' + filePath + '</title></head><body>');
                    response.write('<a href="/cmpApp/static/index.html" target="_blank"><h1>&nbsp;&nbsp; Start CmpApp </h1></a>');
                    response.write('<h1>' + filePath + '</h1>');
                    response.write('<ul style="list-style:none;font-family:courier new;">');
                    files.unshift('.', '..');
                    files.forEach(function (item) {

                        var urlpath, itemStats;
                        if (pathname.indexOf("cmpApp") >= 0) {
                            urlpath = pathname.substr(pathname.indexOf("cmpApp") + 6) + item;
                            itemStats = fs.statSync(__dirname + "\\.." + urlpath);
                        } else {
                            urlpath = pathname + item
                            itemStats = fs.statSync(currentDir + urlpath);

                        }

                        if (itemStats.isDirectory()) {
                            urlpath += '/';
                            item += '/';
                        }

                        response.write('<li><a href="' + urlpath + '">' + item + '</a></li>');
                    });

                    response.end('</ul></body></html>');
                });
            }
        });
    }
}
let createServer = function (config) {

    currentDir = config.path || currentDir;
    port = +(config.port || port);
    let server = http.createServer(handleRequest).listen(port);
    // console.log(port);

    require('dns').lookup(require('os').hostname(), function (err, addr, fam) {
        console.log('server Running at http://' + addr + ((port == 80) ? '' : (':' + port)) + '/');
    })
    console.log(!config.start);
    if (config.start == "true") {
        //打开浏览器
        exec("start http://127.0.0.1" + ((port == 80) ? '' : (':' + port)) + '/cmpApp/static/index.html');
    }
    console.log('Base directory at ' + currentDir);
    return server;
}
export default createServer