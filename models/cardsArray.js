var mongoose = require("mongoose");

cardArraySchema = new mongoose.Schema({
	cards: [String]
});


module.exports = mongoose.model("CardsArray", cardArraySchema);