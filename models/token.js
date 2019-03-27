var mongoose = require("mongoose");

var tokenSchema = new mongoose.Schema({
	name: String,
	image: String,
	scryfallid: String
});

module.exports = mongoose.model("Token", tokenSchema);

