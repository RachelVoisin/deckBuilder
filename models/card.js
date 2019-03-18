var mongoose = require("mongoose");

var cardSchema = new mongoose.Schema({
	name: String,
	image: String,
	typeline: String,
	oracleid: String,
	scryfallid: String,
	colors: Array,
	cmc: Number,
	tokens: [{
		name: String,
		scryfallid: String
	}]
});

module.exports = mongoose.model("Card", cardSchema);

/*
object: card
id
oracle_id (string)
multiverse_ids (array)
name
lang 
released_at (date)
uri
scryfall_uri 
layout: normal 
highres_image (bool)
image_uris (object - small, normal, large, png, art_crop, border_crop)
mana_cost {3} // ???
cmc (number)
type_line (string)
oracle_text 
colors (array) // colors are single letters
color_identity (array) // includes colors in activated abilities 
all_parts (array of objects - object:"related_card", component: "combo_piece" or "token", id, name, uri)
legalities (object - standard, legacy, vintage, commander, ect. values "legal" or "not_legal"
reserved (bool)
foil (bool)
nonfoil (bool)
oversized (bool)
promo (bool)
reprint (bool)
set (string) //code
set_name (string)
set_uri
set_search_uri
scryfall_set_uri 
rulings_uri
prints_search_uri 
collector_number (string)
digital (bool)
rarity (string)
flavor_text (string)
illustration_id 
artist (string)
border_color 
frame (string) //year 
frame_effect 
full_art (bool)
story_spotlight (bool)
edhrec_rank (number)
related_uris (object - gatherer, tcgplayer_decks, edhrec, mtgtop8)
*/

