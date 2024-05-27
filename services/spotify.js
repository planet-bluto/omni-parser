const meta = {name: "Spotify", code: "SP"}

const print = console.log

var fetch = require('node-fetch')
var {trackBuilder, listBuilder} = require("../builders.js")

var token_cache = null
async function getAccess() {
  if (token_cache == null || Date.now() >= token_cache.expires_timestamp) {
    var res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: process.env["SPOTIFY_CLIENT_ID"],
        client_secret: process.env["SPOTIFY_CLIENT_SECRET"]
      })
    })

    token_cache = await res.json()
    token_cache["obtain_timesamp"] = Date.now()
    token_cache["expires_timestamp"] = (token_cache["obtain_timesamp"] + (token_cache["expires_in"]*1000))
  }

  return token_cache.access_token
}

function toURL(uri) {
  var uriBits = uri.split(":")
  uriBits[0] = "https://open.spotify.com"
  return uriBits.join("/")
}

async function trackFunc(input, uses_id = false) {
  var id = input
  if (!uses_id) {
    var urlBits = input.split("?")[0].split("/")
    id = urlBits[4]
  }

  var accessToken = await getAccess()

  var res = await fetch(`https://api.spotify.com/v1/tracks/${id}`, {
    headers: {
      "Authorization": `Bearer ${accessToken}`
    }
  })

  var info = await res.json()
  
	return trackBuilder(
		info.name,
		info.artists.map(artist => artist.name).join(", "),
		toURL(info.artists[0].uri),
		toURL(info.uri),
		info.album.images[0].url,
		info.id,
		meta,
		"",
		info.popularity
	)
}

async function listFunc(input, lazy = false) {
  return null
}

async function determine(input, options = {}) {
	var urlBits = input.split("/")

	var domainBits = urlBits[2].split(".")
	var trueHost = (domainBits[domainBits.length-2] + "." + domainBits[domainBits.length-1])
	var urlObject = new URL(input)

	if ("open.spotify.com" == urlObject.host) {
		return trackFunc(input)
	}
}

module.exports = {
	meta: meta,
	trackFunc: trackFunc,
	listFunc: listFunc,
	determine: determine,
}