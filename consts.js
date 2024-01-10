const META = {
	youtube: {
		code: "YT",
		fancy: "YouTube",
		name: "youtube"
	},
	soundcloud: {
		code: "SC",
		fancy: "Soundcloud",
		name: "soundcloud"
	},
	bandcamp: {
		code: "BC",
		fancy: "Bandcamp",
		name: "bandcamp"
	},
}

const ServiceMatch = {
	"YT": META.youtube,
	"SC": META.soundcloud,
	"BC": META.bandcamp,
	"youtube.com": META.youtube,
	"youtu.be": META.youtube,
	"soundcloud.com": META.soundcloud,
	"bandcamp.com": META.bandcamp
}

module.exports = {
	ServiceMatch: ServiceMatch
}