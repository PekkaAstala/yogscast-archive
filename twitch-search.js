'use strict'

let https = require('https')

exports.handler = (event, context, callback) => {

    const done = (err, res) => callback(null, {
        statusCode: err ? '400' : '200',
        body: err ? ':(' : JSON.stringify(res),
        headers: {
            'Content-Type': 'application/json',
        },
    })

    let twitchReqParams = {
        host: "api.twitch.tv",
        path: "/kraken/channels/yogscast/videos" +
            "?limit=100" +
            "&broadcasts=true" +
            "&offset=800",
        headers: {
            "Client-ID": process.env.TWITCH_CLIENT_ID
        }
    }

    let resultReducer = element => {
        return {
            "title": element.title,
            "url": element.url
        }
    }

    let twitchCallback = function(response) {
      let str = ''

      response.on('data', function (chunk) {
        str += chunk
      });

      response.on('end', function () {
          done(null, JSON.parse(str).videos.map(resultReducer))
      })
    }

    https.request(twitchReqParams, twitchCallback).end()
}
