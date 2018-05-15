"use strict";

let cluster = require('cluster');
let fs = require('fs');
let path = require('path');

// master process
if (cluster.isMaster) {

    cluster.on('disconnect', (worker) => {
        let now = new Date();
        let m = 'cluster '+worker.id+' disconnected';

        fs.appendFile(path.join(__dirname, '/logs/check_execution.txt'), now + ' - ' + m + '\r\n');

        // create new worker
        cluster.fork();
    });

    // create worker (can be more than one, depends on number of CPUs)
    cluster.fork();

// worker process
} else {

    let express = require('express');
    let app = express();
    let rp = require('request-promise');
    let domain = require('domain');

    app.get('/', (req, res, next) => {

        res.send("Hello World!");

    });

    app.get('/path', (req, res) => {

        let param = req.query.param;
        let now = null;
        let message = "";

        // built url
        let url = "https://api.url?param=" + param;

        // create domain
        let d = domain.create();

        // handle current domain's error
        d.on('error', (err) => {

            try {
                // exit with a 'failure' code within 10 seconds
                let timer = setTimeout(function() {
                    process.exit(1);
                }, 10000);

                // end the process
                timer.unref();

                // disconnect worker
                cluster.worker.disconnect();

                // trace error
                now = new Date();
                fs.appendFile(path.join(__dirname, '/logs/errors.txt'), now + ' - ' + err.stack + '\r\n');

                res.end(now + ' - Catched domain error - see /logs');


            } catch (e) {

                // trace error
                now = new Date();
                fs.appendFile(path.join(__dirname, '/logs/errors.txt'), now + ' - ' + e + '\r\n');
            }

        });

        // launch request inside domain
        d.run(() => {

            // call API
            rp(url, (error, response, body) => {

                return JSON.parse(body);

            }).then((result) => {

                // return
                res.end('ok');

                // trace execution
                now = new Date();
                message = " Request on: " + url;
                fs.appendFile(path.join(__dirname, '/logs/check_execution.txt'), now + ' - ' + message + '\r\n');

            }).catch((err) => {

                now = new Date() + '\r\n';
                message = 'Bad request '+ url;

                // throw error to current domain
                d.emit('error', new Error(message));
            });
        });
    });

    // launch server on port 3000
    app.listen(3000, () => console.log('App on port 3000 - cluster worker id=' + cluster.worker.id));
}
