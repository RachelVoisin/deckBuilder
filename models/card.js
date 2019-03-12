var mongoose = require("mongoose");

var cardSchema = new mongoose.Schema({
	name: String,
	image: String,
	type: String,
	oracleid: String,
});

module.exports = mongoose.model("Card", cardSchema);

