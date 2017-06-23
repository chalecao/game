import {
    parse,
    get
} from "opts";
import {
    resolve
} from "path";
import pjson from "pjson";
import createServer from './server.js';

let version = pjson.version;

parse([{
    short: "v",
    long: "version",
    description: "Show the version",
    required: false,
    callback: function () {
        console.log(version);
        return process.exit(1);
    }
}, {
    short: "p",
    long: "port",
    description: "Specify the port",
    value: true,
    required: false
}].reverse(), true);

let port = get('port') || 8888;
let path = resolve(process.argv[2] || './');
let server = createServer({
    port: port,
    path: path
});
console.log("Starting server v" + version + " for " + path + " ......");
// 管理连接
var sockets = [];
server.on("connection", function (socket) {
    sockets.push(socket);
    socket.once("close", function () {
        sockets.splice(sockets.indexOf(socket), 1);
    });
});
//关闭之前，我们需要手动清理连接池中得socket对象
function closeServer() {
    sockets.forEach(function (socket) {
        socket.destroy();
    });
    server.close(function () {
        console.log("close server!");
    });
}
module.exports = closeServer;