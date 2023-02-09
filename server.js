const express = require("express");
const helmet = require('helmet');
const morgan = require('morgan')
const httpsRedirect = require('express-https-redirect');
const fs = require("fs");
const https = require("https");
const http = require('http')
const path = require("path");
const app = express();

const port = process.env.DEV ? 3000 : 80
const portSecure = process.env.DEV ? 3001 : 443

app.use('/static', express.static(path.join(__dirname, '/build/static')));

if (!process.env.DEV) {
    app.use('/', helmet())
    app.use('/', httpsRedirect)
}

app.use('/', morgan('dev'))

app.get('/terminal', (req, res) => {
    res.sendFile(path.join(__dirname, '/build/index.html'))
})
http
    .createServer(app)
    .listen(port,() => {
        console.log(
            `app listening on ${port}`
        );
    });

if(!process.env.DEV)
    https
    .createServer(
        {
            key: fs.readFileSync("/etc/letsencrypt/live/www.cmrnw.com/privkey.pem"),
            cert: fs.readFileSync("/etc/letsencrypt/live/www.cmrnw.com/fullchain.pem"),
        },
        app
    )
    .listen(portSecure,() => {
        console.log(
            `app listening on ${portSecure}`
        );
    });
