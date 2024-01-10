const print = console.log

require("./arrayLib.js")

var Services = {
	YT: require("./services/youtube.js"),
	SC: require("./services/soundcloud.js"),
	BC: require("./services/bandcamp.js")
}

function registerService(meta = null, trackFunc = null, listFunc = null, determine = null) {
	if (typeof trackFunc == 'string') {
		Services[meta] = require(trackFunc)
	} else {
		Services[meta.code] = {
			meta: meta,
			trackFunc: trackFunc,
			listFunc: listFunc,
			determine: determine,
		}
	}
}

class OmniParser {
	constructor(url) {
		this.url = url
	}

	async parse(input, options = {}) {
		if (input == null) { input = "" }
		if (input.startsWith("http")) {
			var res = null

			await Object.values(Services).asyncForEach(async service => {
				// print(service.meta.name, input)
				var tempRes = await service.determine(input, options)
				if (tempRes != null) { res = tempRes }
			})

			// if (res == null) { throw (new Error("Invalid URL")) }

			return res
		} else {
			var idBits = input.split("_")
			var service_code = idBits.shift()
			var service_id = idBits.join("_")

			var res = null
			if (Services[service_code] != null) {
				res = await Services[service_code].trackFunc(service_id, true)
			}

			// if (res == null) { throw (new Error("Invalid Input")) }
			return res
		}
	}
}

var {trackBuilder, listBuilder} = require("./builders.js")

module.exports = {
	OmniParser: (...args) => { var thisInst = new OmniParser(...args); return thisInst.parse },
	registerService: registerService,
	trackBuilder,
	listBuilder
}