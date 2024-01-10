const print = console.log
const {ServiceMatch} = require("./consts.js")

function trackBuilder(title, author_name, author_url, url, image, service_id, service, desc = null, likes = null) {
	return {
		title: title,
		author: {
			name: author_name,
			url: author_url
		},
		url: url,
		image: image,
		type: "track",
		service: {
			id: service_id,
			code: service.code,
			name: service.name
		},
		omni_id: `${service.code}_${service_id}`,
		desc: desc,
		likes: likes
	}
}
// return trackBuilder(
// 	TITLE,
// 	AUTHOR_NAME,
// 	AUTHOR_URL,
// 	PERMA_URL,
// 	IMAGE_URL,
// 	SERVICE_ID,
// 	SERVICE_CODE,
// 	DESCRIPTION,
// 	LIKE_COUNT
// )

function listBuilder(title, author_name, author_url, tracks, url, image, lazy, service_id, service, desc = null, likes = null) {
	return {
		title: title,
		author: {
			name: author_name,
			url: author_url
		},
		tracks: tracks,
		url: url,
		image: image,
		is_lazy: lazy,
		type: "list",
		service: {
			id: service_id,
			code: service.code,
			name: service.name
		},
		desc: desc,
		likes: likes
	}
}
// return listBuilder(
// 	TITLE,
// 	AUTHOR_NAME,
// 	AUTHOR_URL,
// 	TRACK_ARRAY,
// 	PERMA_URL,
// 	IMAGE_URL,
// 	lazy,
// 	SERVICE_ID,
// 	SERVICE_CODE,
// 	DESCRIPTION,
// 	LIKE_COUNT
// )

module.exports = {
	trackBuilder: trackBuilder,
	listBuilder: listBuilder
}