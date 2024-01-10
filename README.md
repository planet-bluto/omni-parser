# Omni-Paresr
Parses links from music streaming services into parseable objects; Used for Omni but is also modular

```js
var {OmniParser, registerService} = require('./main.js')
var omni_parse = OmniParser()

omni_parse("https://www.youtube.com/watch?v=3C8aEpq5vEA").then(track => {
	track // Serialized data
})

omni_parse("https://soundcloud.com/aquasine/hyperlink").then(track => {
	track // Serialized data
})

omni_parse("https://idogedochiptune.bandcamp.com/album/fm-series", {lazy: true}).then(trackList => {
	trackList // Serialized data
	trackList.tracks // List of IDs
})

omni_parse("https://idogedochiptune.bandcamp.com/album/fm-series").then(trackList => {
	trackList // Serialized data
	trackList.tracks // List of TrackObjects
})
```

---

## OmniParse( link|ID: string ) -> TrackObject|TrackListObject|Null
- Main function that returns a serialized object from a link or ID

## TrackObject
- **``[ String ]`` title**: Title of the track
- **``[ Object ]`` author**: Information about the uploader of the track
	- **``[ String ]`` name**: Display name of the author on service
	- **``[ String ]`` url**: Link to author's profile on service
- **``[ String ]`` url**: Link to track on service
- **``[ String ]`` image**: Link to an image representing the track on service
- **``[ String ]`` type**: Type of object (will always be 'track' in this case)A
- **``[ Object ]`` service**: Information about the track's service provider
	- **``[ String ]`` name**: Fancy name for service
	- **``[ String ]`` code**: 2 character string representing service (used as a unique identifier)
	- **``[ String OR Number ]`` id**: ID of track on service
- **``[ String ]`` omni_id**: Neat ID that *should* be permanent and be fed into the ``OmniParse`` function (Service Code + "_" + Service ID)
- **``[ String|Null ]`` desc**: Description on service (if applicable)
- **``[ String|Null ]`` likes**: Amount of likes on service (if applicable)

## TrackListObject
- **``[ String ]`` title**: Title of the tracklist
- **``[ Object ]`` author**: Information about the uploader of the tracklist
	- **``[ String ]`` name**: Display name of the author on service
	- **``[ String ]`` url**: Link to author's profile on service
- **``[ Array[String|Object] ]`` tracks**: Array of either track IDs (encoded in omni_id format) OR TrackObjects
- **``[ String ]`` url**: Link to tracklist on service
- **``[ String ]`` image**: Link to an image representing the track on service
- **``[ String ]`` type**: Type of object (will always be 'list' in this case)A
- **``[ Object ]`` service**: Information about the track's service provider
	- **``[ String ]`` name**: Fancy name for service
	- **``[ String ]`` code**: 2 character string representing service (used as a unique identifier)
	- **``[ String OR Number ]`` id**: ID of track on service
- **``[ String|Null ]`` desc**: Description on service (if applicable)
- **``[ String|Null ]`` likes**: Amount of likes on service (if applicable)

---

## Modular Support
Add in support for any service you can think of
```js
// registerService(<meta>, <trackFunc>, <listFunc>, <determine>)

async function trackFunc(input) {
	// Get info somehow...

	return trackBuilder(
		<title>,
		<author.name>,
		<author.url>,
		<url>,
		<image>,
		<service_id>,
		<service_code>,
		<desc>,
		<likes>
	)
}


async function listFunc(input, lazy = false) {
	// Get info somehow...

	var newTracks = await getTracksSomehow().forEach(async track => {
		if (!lazy) {
			return await trackFunc(track.url)
		} else {
			return (`EX_${track.id}`)
		}
	})

	return listBuilder(
		<title>,
		<author.name>,
		<author.url>,
		<tracks>,
		<url>,
		<image>,
		<service_id>,
		<service_code>,
		<desc>,
		<likes>
	)
}

registerService({name: "SERVICE NAME", code: "EX"}, trackFunc, listFunc, determine)
```

---

### Planned Features:
- Get readable streams for tracks
- More services? (Spotify, Deezer?)