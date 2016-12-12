'use strict'

let https = require('https')

exports.handler = (event, context, callback) => {

    const done = (err, res) => callback(null, {
        statusCode: err ? '400' : '200',
        body: err ? ':(' : JSON.stringify(res),
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
    })

    let queryString = event.queryStringParameters.q;
    if (!queryString) {
        done(null, [])
    }

    let youtubeReqParams = {
        host: "content.googleapis.com",
        path: "/youtube/v3/search" +
            "?q=" + encodeURIComponent(queryString) +
            "&maxResults=50" +
            "&safeSearch=none" +
            "&order=relevance" +
            "&channelId=UCH-_hzb2ILSCo9ftVSnrCIQ" +
            "&part=snippet" +
            "&key=" + process.env.YOUTUBE_API_KEY
    }

    let resultReducer = element => {
        return {
            "title": element.snippet.title,
            "url": "https://www.youtube.com/watch?v=" + element.id.videoId,
            "thumbnail": element.snippet.thumbnails.medium.url,
            "date": element.snippet.publishedAt
        }
    }

    let youtubeCallback = function(response) {
      let str = ''

      response.on('data', function (chunk) {
        str += chunk
      });

      response.on('end', function () {
          done(null, JSON.parse(str).items.map(resultReducer))
      })
    }

    https.request(youtubeReqParams, youtubeCallback).end()
}
