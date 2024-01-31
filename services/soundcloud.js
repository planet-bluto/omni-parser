const meta = {name: "Soundcloud", code: "SC"}

const print = console.log
var fetch = require('node-fetch')
var SoundCloud = require("scdl-core").SoundCloud
SoundCloud.clientId = (process.env["SC_CLIENT_ID"] || "zy0ijES9ACCAxntrQj4MN4wKRlluii0I")

var {trackBuilder, listBuilder} = require("../builders.js")

async function trackFunc(input, uses_id = false) {
	var res = null

	if (!uses_id) {
		try {
			res = await SoundCloud.tracks.getTrack(input)
		} catch(err) {
			print("Not real... ", input)
			res = null
		}
		// print(res)
	} else {
		try {
			var thisRes = await SoundCloud.tracks.getTracksByIds([input])
			res = thisRes[0]
		} catch(err) {
			print("Not real... ", input)
			res = null
		}
	}

	if (res != null) {
		return trackBuilder(
			res.title,
			res.user.username,
			res.user.permalink_url,
			res.permalink_url,
			(res.artwork_url || res.user.avatar_url).replace("-large.jpg", "-t500x500.jpg"),
			res.id,
			meta,
			res.description,
			res.likes_count
		)
	} else {
		return null
	}
}

async function listFunc(input, lazy = false) {
	var res = await SoundCloud.playlists.getPlaylist(input)
	var image = res.artwork_url

	var newTracks = await res.tracks.awaitForEach(async (trackObj, index) => {
		if (!lazy) {
			var thisTrack = trackBuilder(
				trackObj.title,
				trackObj.user.username,
				trackObj.user.permalink_url,
				trackObj.permalink_url,
				(trackObj.artwork_url || trackObj.user.avatar_url).replace("-large.jpg", "-t500x500.jpg"),
				trackObj.id,
				meta,
				trackObj.description,
				trackObj.likes_count
			)

			if (thisTrack != null) {
				if (index == 0 && image == null) {
					image = thisTrack.image
				}
				return thisTrack
			}
		} else {
			if (index == 0 && image == null) {
				var thisTrack = await trackFunc(trackObj.id, true)
				if (thisTrack != null) {
					image = thisTrack.image
				}
			}
			return (`SC_${trackObj.id}`)
		}
	})

	newTracks = newTracks.filter(track => track != null)

	return listBuilder(
		res.title,
		res.user.username,
		res.user.permalink_url,
		newTracks,
		res.permalink_url,
		image,
		lazy,
		res.id,
		meta,
		res.description,
		res.likes_count
	)
}

async function determine(input, options = {}) {
	var urlBits = input.split("/")

	var domainBits = urlBits[2].split(".")
	var trueHost = (domainBits[domainBits.length-2] + "." + domainBits[domainBits.length-1])
	var urlObject = new URL(input)

	if (urlObject.host == "soundcloud.com") {
		if (urlBits[4] == "sets" && urlBits.length > 4) {
			return listFunc(input, options.lazy)
		} else {
			return trackFunc(input)
		}
	} else if (urlObject.host == "on.soundcloud.com") {
		var res = await fetch(input)
		return trackFunc(res.url)
	}
}

async function multiple(ids) {
	// ids = ids.map(id => Number(id))
	print(ids)
	var res = await SoundCloud.tracks.getTracksByIds(ids)
	res = res.map(trackObj => {
		return trackBuilder(
			trackObj.title,
			trackObj.user.username,
			trackObj.user.permalink_url,
			trackObj.permalink_url,
			(trackObj.artwork_url || trackObj.user.avatar_url).replace("-large.jpg", "-t500x500.jpg"),
			trackObj.id,
			meta,
			trackObj.description,
			trackObj.likes_count
		)
	})

	return res
}

module.exports = {
	meta,
	trackFunc,
	listFunc,
	determine,
	multiple,
}