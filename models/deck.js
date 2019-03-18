var mongoose = require("mongoose");

var deckSchema = new mongoose.Schema({
	name: String,
	image: String,
	color: String,
	note: String,
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		username: String
	},
	dateUpdated: String,
	cards: [{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Card"		
			}], // add amount
	cardsToBuy: [{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Card"		
				}],
	cardsWishlist: [{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Card"		
				}],
	cardsCut: [{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Card"		
			}],
	basics: {
		swamp: Number,
		forest: Number,
		island: Number,
		plains: Number,
		mountain: Number
	}
});

module.exports = mongoose.model("Deck", deckSchema);