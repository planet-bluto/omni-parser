const meta = {name: "Bandcamp", code: "BC"}

const print = console.log
var bcscrape = require('bandcamp-scraper')
var fetch = require('node-fetch')

var {trackBuilder, listBuilder} = require("../builders.js")

async function getInfo( type, url ) {
	return new Promise((res, rej) => {
		bcscrape[`get${type}Info`](url, (err, info) => {
			res(info)
		})
	})
}

async function getTrackFromID( ID ) {
	var res = await fetch(`https://bandcamp.com/api/mobile/24/tralbum_details?band_id=1&tralbum_type=t&tralbum_id=${ID}`)
	var info = await res.json()
	// print(info)
	return getInfo("Track", info.bandcamp_url)
}

async function trackFunc(input, uses_id = false) {
	var image = null
	var info = null

	if (!uses_id) {
		info = await getInfo("Track", input)
	} else {
		info = await getTrackFromID(input)
	}

	if (info.raw.art_id != null) {
		image = `https://f4.bcbits.com/img/a${info.raw.art_id}_10.jpg`
	} else if (info.raw.album_url != null) {
		var albumUrl = `https://${info.raw.artist}.bandcamp.com${info.raw.album_url}`
		var albumInfo = await getInfo("Album", albumUrl)

		image = albumInfo.imageUrl
	} else {
		image = ""
	}

	return trackBuilder(
		info.title,
		info.raw.artist,
		`https://${info.raw.artist}.bandcamp.com`,
		info.url,
		image,
		info.trackId,
		meta,
		null,
		null
	)
}

async function listFunc(input, lazy = false) {
	var info = await getInfo("Album", input)
	
	var newTracks = await info.tracks.awaitForEach(async (track) => {
		if (!lazy) {
			return await trackFunc(track.url)
		} else {
			var thisTrack = await getInfo("Track", track.url)
			return (`BC_${thisTrack.trackId}`)
		}
	})

	return listBuilder(
		info.title,
		info.artist,
		`${info.artist}.bandcamp.com`,
		newTracks,
		info.url,
		info.imageUrl,
		lazy,
		info.raw.id,
		meta,
		null,
		null
	)
}

async function determine(input, options = {}) {
	var urlBits = input.split("/")

	var domainBits = urlBits[2].split(".")
	var trueHost = (domainBits[domainBits.length-2] + "." + domainBits[domainBits.length-1])
	var urlObject = new URL(input)

	if (trueHost == "bandcamp.com") {
		if (urlBits[3] == "album") {
			return listFunc(input, options.lazy)
		} else if (urlBits[3] == "track") {
			return trackFunc(input)
		}
	}
}

module.exports = {
	meta: meta,
	trackFunc: trackFunc,
	listFunc: listFunc,
	determine: determine,
}