'use strict'

let https = require('https')

let listVideos = (channel, accumulator, offset, callback) => {
    https.request({
        host: "api.twitch.tv",
        path: "/kraken/channels/" + channel + "/videos" +
            "?limit=100" +
            "&broadcasts=true" +
            "&offset=" + offset,
        headers: {
            "Client-ID": process.env.TWITCH_CLIENT_ID
        }
    },
    function(response) {
        let str = ''
        response.on('data', chunk => str += chunk)
        response.on('end', evt => {
            let result = JSON.parse(str)

            let data = accumulator.concat(result.videos)

            if (offset + 100 >= result._total) {
                callback(data)
            }
            else {
                listVideos(channel, data, offset + 100, callback)
            }
        })
    }).
    end()
}

let videoDataReducer = data => {
    return {
        "title": data.title,
        "url": data.url,
        "game": data.game,
        "thumbnail": data.preview,
        "date": data.recorded_at
    }
}

exports.handler = (event, context, callback) => {

    const done = (err, res) => callback(null, {
        statusCode: err ? '400' : '200',
        body: err ? ':(' : JSON.stringify(res),
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
    })

    listVideos("yogscast", [], 0, list => {
        done(null, list.map(videoDataReducer))
    })
}
