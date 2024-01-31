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

	async multiple(ids) {
		var service_res = {}
		var super_res = []

		ids.forEach((id, ind) => {
			var idBits = id.split("_")
			var service_code = idBits.shift()
			var service_id = idBits.join("_")

			if (!Array.isArray(service_res[service_code])) { service_res[service_code] = [] }

			service_res[service_code].push({ind, id: service_id})
			super_res.push(null)
		})

		await Object.keys(service_res).awaitForEach(async service_code => {
			var ids = service_res[service_code].map(entry => entry.id)

			var res;
			if (Services[service_code].multiple) {
				res = await Services[service_code].multiple(ids)
			} else {
				res = ids.awaitForEach(async id => {
					return Services[service_code].trackFunc(id)
				})
			}

			res.forEach(trackObj => {
				var thisEntry = service_res[service_code].find(entry => entry.id == trackObj.service.id)
				thisEntry.track = trackObj
				super_res[thisEntry.ind] = thisEntry
			})
		})

		return super_res
	}
}

var {trackBuilder, listBuilder} = require("./builders.js")

module.exports = {
	OmniParser: (...args) => { var thisInst = new OmniParser(...args); return thisInst.parse },
	MultiLoader: (...args) => { var thisInst = new OmniParser(...args); return thisInst.multiple },
	registerService: registerService,
	trackBuilder,
	listBuilder
}