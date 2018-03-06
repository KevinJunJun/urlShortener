const express = require('express'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    btoa = require('btoa'),
    atob = require('atob'),
    Url = require('./db/Url'),
    // { canConvertObjectId } = require('./util'),
    app = express(),
    connectionString = 'mongodb://localhost:27017/shortenUrl',
    port = process.env.PORT || 8080,
    baseUri = `http://localhost:${port}`;

const connection = mongoose.connect(connectionString, {
    // useMongoClient: true
})
connection.then(db => {
    console.log('MongoDB connected!')
}).catch(err => {
    console.log('MongoDB connection error', err)
})

app.use(express.static('public'))

app.use(bodyParser.urlencoded({
    extended: true
}))

app.get('/', (req, res) => {
    res.sendFile('views/index.html', {
        root: __dirname
    });
})



function getShortUrlFromHash(hash) {
    return `${baseUri}/${hash}`
    // return baseUri + '/st/' + hash
}

// shorten url api
app.post('/shorten', (req, res, next) => {
    let url = req.body.url;
    Url.findOne({ url }, (err, doc) => {
        if (doc) {
            console.log('entry found in db')
            res.send({
                url,
                hash: getShortUrlFromHash(btoa(doc.count)),
                status: 200,
                statusText: 'OK'
            })
        } else {
            console.log('entry NOT found in db, saving new')
            let newUrl = new Url({ url });
            newUrl.save((err) => {
                if (err) {
                    return next(err)
                }

                res.send({
                    url,
                    shortUrl: getShortUrlFromHash(btoa(newUrl.count)),
                    status: 200,
                    statusText: 'OK'
                });
            })
        }
    })
})

// redirect api
app.get('/:hash', (req, res, next) => {
    let hash = req.params.hash
    let count = atob(hash)

    Url.findOne({ count }, (err, doc) => {
        if (err) {
            // err.message = 'invalid short url'
            return res.sendStatus(400)
        }

        if (doc) {
            res.redirect(doc.url)
        } else {
            res.sendStatus(404)
        }
    })

})


app.use((err, req, res, next) => {
    res.status(500).send({
        status: 500,
        message: err.message || 'internal server error'
    });
})


app.listen(port, function () {
    console.log(`server listening on: ${port}; `, `visit ${baseUri}`)
}) 