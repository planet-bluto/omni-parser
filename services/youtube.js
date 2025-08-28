const meta = {name: "YouTube", code: "YT"}

const print = console.log
const ytdl = require('@distube/ytdl-core')
const ytpl = require('@distube/ytpl')

var {trackBuilder, listBuilder} = require("../builders.js")

async function trackFunc(input, _uses_id = false) {
	let info = await ytdl.getInfo(input)
	return trackBuilder(
		info.videoDetails.title,
		info.videoDetails.author.name,
		info.videoDetails.author.channel_url,
		info.videoDetails.video_url,
		info.videoDetails.thumbnails.last().url,
		info.videoDetails.videoId,
		meta,
		info.videoDetails.description,
		info.videoDetails.likes
	)
}

async function listFunc(input, lazy = false) {
	let playlist_obj = await ytpl(input)

	var newTracks = await playlist_obj.items.awaitForEach(async item => {
		if (!lazy) {
			return await trackFunc(item.id)
		} else {
			return (`YT_${item.id}`)
		}
	})

	// print(newTracks)

	return listBuilder(
		playlist_obj.title,
		(playlist_obj.author?.name || "Auto-Generated"),
		(playlist_obj.author ? `https://www.youtube.com/channel/${playlist_obj.author.channelID}` : null),
		newTracks,
		playlist_obj.url,
		playlist_obj.bestThumbnail.url,
		lazy,
		playlist_obj.id,
		meta,
		playlist_obj.description,
		null
	)
}

async function determine(input, options = {}) {
	var urlBits = input.split("/")

	var domainBits = urlBits[2].split(".")
	var trueHost = (domainBits[domainBits.length-2] + "." + domainBits[domainBits.length-1])
	var urlObject = new URL(input)

	if ("www.youtube.com" == urlObject.host || "music.youtube.com" == urlObject.host) {
		if (urlBits[3].startsWith("playlist")) {
			return listFunc(input, options.lazy)
		} else {
			return trackFunc(input)
		}
	} else if ("youtu.be" == urlObject.host) {
		return trackFunc(input)
	}
}

module.exports = {
	meta: meta,
	trackFunc: trackFunc,
	listFunc: listFunc,
	determine: determine,
}