var express = require("express");
var router = express.Router();

var objSort = require("../public/scripts/objSort");
var numberToWords = require('number-to-words');

var User = require("../models/user"),
    Deck = require("../models/deck"),
	Card = require("../models/card");

var middleware = require("../middleware"); // contents of index.js is automatically required if you require a directory

router.get("/autocomplete", function(req, res){
	Card.find({}, function(err, allCards){
		if(err){
			console.log(err);
		} else {
			var data = [];
			allCards.forEach(function(card){
				data.push(card.name);
			});
			res.send(data);
		}
	});
});

router.get("/graphs", function(req, res){
	Deck.findById(req.query.id).populate("cards").exec(function(err, deck){
		if(err){
			console.log(err);
		} else {
			var data = {
				landMana: [],
				cardMana: [],
				type: [],
				cmc: []
			};
			for(var i = 0; i < 12; i++){
				data.cmc.push(0);
			}
			for(var i = 0; i < 7; i++){
				data.type.push(0);
			}
			for(var i = 0; i < 6; i++){
				data.landMana.push(0);
				data.cardMana.push(0);
			}
			
			data.landMana[0] += deck.basics.plains;
			data.landMana[1] += deck.basics.island;
			data.landMana[2] += deck.basics.swamp;
			data.landMana[3] += deck.basics.mountain;
			data.landMana[4] += deck.basics.forest;
			
			data.type[0] += deck.basics.forest + deck.basics.mountain + deck.basics.swamp + deck.basics.island + deck.basics.plains;
			
			deck.cards.forEach(function(card){
				if(card.cmc > 10){
					data.cmc[11]++;
				} else {
					data.cmc[card.cmc]++;
				}
				if(card.typeline.includes("Land")){
					data.type[0]++;
					if(card.colors.includes("W")){
						data.landMana[0]++;
					}
					if(card.colors.includes("U")){
						data.landMana[1]++;
					}
					if(card.colors.includes("B")){
						data.landMana[2]++;
					}
					if(card.colors.includes("R")){
						data.landMana[3]++;
					}
					if(card.colors.includes("G")){
						data.landMana[4]++;
					}
				} else {
					if(card.colors.includes("W")){
						data.cardMana[0]++;
					}
					if(card.colors.includes("U")){
						data.cardMana[1]++;
					}
					if(card.colors.includes("B")){
						data.cardMana[2]++;
					}
					if(card.colors.includes("R")){
						data.cardMana[3]++;
					}
					if(card.colors.includes("G")){
						data.cardMana[4]++;
					}
				}
				if(card.typeline.includes("Creature")){
					data.type[1]++;
				} 
				if(card.typeline.includes("Enchantment")){
					data.type[2]++;
				} 
				if(card.typeline.includes("Artifact")){
					data.type[3]++;
				}
				if(card.typeline.includes("Instant")){
					data.type[4]++;
				}
				if(card.typeline.includes("Sorcery")){
					data.type[5]++;
				}
				if(card.typeline.includes("Planeswalker")){
					data.type[6]++;
				}
			});
			res.send(data);
		}
	});
});

// MTG Home Page
router.get("/mtg", function(req, res){
	var page = "mtg";
	Deck.find({}, function(err, allDecks){
		if(err){
			console.log(err);
		} else {
			res.render("mtg/index", {decks: allDecks, page: page});
		}
	});
});

//Sorted Home Page
router.get("/mtg/sort/author", function(req, res){
	var page = "mtg";
	Deck.find({}, function(err, allDecks){
		if(err){
			console.log(err);
		} else {
			var sortedDecks = allDecks.objSort("author.username");
			res.render("mtg/index", {decks: sortedDecks, page: page});
		}
	});
});
router.get("/mtg/sort/name", function(req, res){
	var page = "mtg";
	Deck.find({}, function(err, allDecks){
		if(err){
			console.log(err);
		} else {
			var sortedDecks = allDecks.objSort("name");
			res.render("mtg/index", {decks: sortedDecks, page: page});
		}
	});
});

// Create Deck Form
router.get("/mtg/new", middleware.isLoggedIn, function(req, res){
	var page = "mtg";
	res.render("mtg/new", {page: page});
});

// Create Deck 
router.post("/mtg", middleware.isLoggedIn, function(req, res){
	var name = req.body.name;
	var image = req.body.image;
	
	if(req.body.image == ''){
		image = "/wireframe.png";
	}
	
	var author = {
		id: req.user._id,
		username: req.user.username
	};
	var color = req.body.color;
	var dateUpdated = dateFormat(Date.now(), "mmmm dS, yyyy");
	
	var newDeck = {
		name: name, 
		image: image, 
		author: author, 
		color: color, 
		dateUpdated: dateUpdated,
		basics: {
			swamp: 0,
			forest: 0,
			island: 0,
			plains: 0,
			mountain: 0
		}
	};
	Deck.create(newDeck, function(err, newlycreated){
		if(err){
			console.log(err);
		} else {
			req.flash("success", "New deck created.");
			res.redirect("/mtg");
		}
	});
});

// Deck Show Page
router.get("/mtg/:id", function(req, res){
	renderCardList(req, res, "mtg/show");
});

// Deck Show Page - Color Sort
router.get("/mtg/:id/color", function(req, res){
	renderCardList(req, res, "mtg/show", "color");
});

// Deck Show Page - CMC Sort
router.get("/mtg/:id/cmc", function(req, res){
	renderCardList(req, res, "mtg/show", "cmc");
});

// Deck Update Form
router.get("/mtg/:id/edit", middleware.checkDeckOwnership, function(req, res){
	renderCardList(req, res, "mtg/edit");
});

// Edit Deck Details
router.put("/mtg/:id", middleware.checkDeckOwnership, function(req, res){
	Deck.findByIdAndUpdate(req.params.id, req.body.deck, function(err, deck){
		if(err){
			req.flash("error", "Could not update deck");
			console.log(err);
			res.redirect("/mtg/" + req.params.id);
		} else {
			deck.dateUpdated = dateFormat(Date.now(), "mmmm dS, yyyy");
			deck.save();
			req.flash("success", "Deck Updated");
			res.redirect("/mtg/" + deck._id);
		}
	});
});

// Delete Deck
router.delete("/mtg/:id", middleware.checkDeckOwnership, function(req, res){
	Deck.findByIdAndRemove(req.params.id, function(err){
		if(err){
			req.flash("error", "Could not delete deck");
			res.redirect("/mtg/" + req.params.id);
		} else {
			req.flash("success", "Deck deleted");
			res.redirect("/mtg");
		}
	});
});

// Add Card to Deck 
router.post("/mtg/:id", middleware.checkDeckOwnership, function(req, res){			
	Deck.findById(req.params.id, function(err, deck){
		if(err){
			req.flash("error", "Could not find deck");
			res.redirect("/mtg");
		} else {
			Card.findOne({ "name" : req.body.name }, function(err, foundCard){
				// does name need to be in quotations??
				if(err){
					console.log(err);
				} else if(!foundCard){
					req.flash("error", "Could not find card with that name: " + req.body.name);
					res.redirect("/mtg/" + deck._id);
				} else {
					if(req.body.status === "wishlist"){
						deck.cardsWishlist.push(foundCard._id);
					} else if(req.body.status === "buy"){
						deck.cardsToBuy.push(foundCard._id);
					} else if(req.body.status === "cut"){
						deck.cards.push(foundCard._id);
						decks.cardsCut.push(foundCard._id);
					} else {
						deck.cards.push(foundCard._id);
					}
					deck.dateUpdated = dateFormat(Date.now(), "mmmm dS, yyyy");
					deck.save();
					res.redirect("/mtg/" + deck._id);
				}
			});	
		}
	});
});

// Get Add Comment Form
router.get("/mtg/:id/note", middleware.checkDeckOwnership, function(req, res){
	renderCardList(req, res, "mtg/notes/edit");
});

//  PUT a new Comment
router.put("/mtg/:id/note", middleware.checkDeckOwnership, function(req, res){
	Deck.findById(req.params.id, function(err, deck){
		if(err){
			req.flash("error", "Could not find deck");
			res.redirect("/mtg");
		} else {
			deck.note = req.body.text;
			deck.dateUpdated = dateFormat(Date.now(), "mmmm dS, yyyy");
			deck.save();
			req.flash("success", "Note Added");
			res.redirect("/mtg/" + req.params.id);
		}
	});
});

// Card Update Page
router.get("/mtg/:id/:cardId", middleware.checkDeckOwnership, function(req, res){
	var page = "mtg";
	Deck.findById(req.params.id, function(err, foundDeck){
		if(err){
			req.flash("error", "Could not find deck");
			res.redirect("/mtg");
		} else {
			Card.findById(req.params.cardId, function(err, foundCard){
				if(err){
					req.flash("error", "Could not find card");
					res.redirect("/mtg/" + req.params.id);
				} else {
					var status = "Owned";
					var index = foundDeck.cardsToBuy.indexOf(foundCard._id);
					if(index > -1) {
						status = "To Buy";
					}
					index = foundDeck.cardsWishlist.indexOf(foundCard._id);
					if(index > -1) {
						status = "Wishlist";
					} 
					index = foundDeck.cardsCut.indexOf(foundCard._id);
					if(index > -1) {
						status = "Possible Cut";
					}
					res.render("mtg/cards/show", {deck: foundDeck, card: foundCard, status: status, page: page});
				}
			});
		}
	});
});

// Remove Card from List
router.delete("/mtg/:id/:cardId", middleware.checkDeckOwnership, function(req, res){
	Deck.findById(req.params.id, function(err, deck){
		if(err){
			req.flash("error", "Could not find deck");
			res.redirect("/mtg");
		} else {
			Card.findById(req.params.cardId, function(err, card){
				if(err){
					req.flash("error", "Could not find card");
					res.redirect("/mtg/" + req.params.id);
				} else {
					var index = deck.cards.indexOf(card._id);
					if(index > -1) {
						deck.cards.splice(index, 1);
					} 
					index = deck.cardsToBuy.indexOf(card._id);
					if(index > -1) {
						deck.cardsToBuy.splice(index, 1);
					}
					index = deck.cardsWishlist.indexOf(card._id);
					if(index > -1) {
						deck.cardsWishlist.splice(index, 1);
					}
					index = deck.cardsCut.indexOf(card._id);
					if(index > -1) {
						deck.cardsCut.splice(index, 1);
					}
					deck.dateUpdated = dateFormat(Date.now(), "mmmm dS, yyyy");
					deck.save();
					req.flash("success", "Card removed");
					res.redirect("/mtg/" + req.params.id);
				}
			});
		}
	});
});

// Add to Buy List
router.put("/mtg/:id/:cardId/buy", middleware.checkDeckOwnership, function(req, res){
	editCardStatus(req, res, "ToBuy");
});

// Add to Wishlist
router.put("/mtg/:id/:cardId/wishlist", middleware.checkDeckOwnership, function(req, res){
	editCardStatus(req, res, "Wishlist");
});

// Add to Cut List
router.put("/mtg/:id/:cardId/cut", middleware.checkDeckOwnership, function(req, res){
	editCardStatus(req, res, "Cut");
});

// Add to Own List
router.put("/mtg/:id/:cardId/own", middleware.checkDeckOwnership, function(req, res){
	editCardStatus(req, res, "");
});

function editCardStatus(req, res, list){
	Deck.findById(req.params.id, function(err, deck){
		Card.findById(req.params.cardId, function(err, card){
			if(err){
					req.flash("error", "Could not find card");
					res.redirect("/mtg/" + req.params.id);
			} else {
				//remove from all lists
				var index = deck.cardsToBuy.indexOf(card._id);
				if(index > -1) {
					deck.cardsToBuy.splice(index, 1);
				}
				index = deck.cardsWishlist.indexOf(card._id);
				if(index > -1) {
					deck.cardsWishlist.splice(index, 1);
				}
				index = deck.cardsCut.indexOf(card._id);
				if(index > -1) {
					deck.cardsCut.splice(index, 1);
				}
				index = deck.cards.indexOf(card._id);
				if(index > -1) {
					deck.cards.splice(index, 1);
				}
				//add to proper list
				var addTo = "cards" + list;
				deck[addTo].push(card._id);
				if(list === "Cut"){
					deck.cards.push(card._id);
				}
				//save deck
				deck.dateUpdated = dateFormat(Date.now(), "mmmm dS, yyyy");
				deck.save();
				req.flash("success", "Card updated");
				res.redirect("/mtg/" + req.params.id);
			}
		});
	});
}

function renderCardList(req, res, render, sort = "type"){
	var page = "mtg";
	Deck.findById(req.params.id)
	.populate("cards").populate("cardsWishlist").populate("cardsToBuy").populate("cardsCut")
	.exec(function(err, foundDeck){
		if(err){
			console.log(err);
			req.flash("error", "Could not find deck");
			res.redirect("/mtg");
		} else {
			var typesOrdered = [];
			var lengthsOrdered = [];
			
			var lengths = [];
			var types = [];
			var cards = {};
			
			var deckTokens = [];
			
			if(sort == "type"){
				types = ["Lands", "Creatures", "Enchantments", "Artifacts", "Instants", "Sorceries", "Planeswalkers"];
				types.forEach(function(type){
					lengths.push(0);
					cards[type] = [];
				});
				
				foundDeck.cards.forEach(function(card){
					if(card.typeline.includes("Land")){
						lengths[0]++;
						cards.Lands.push(card);
					} else if(card.typeline.includes("Creature")){
						lengths[1]++;
						cards.Creatures.push(card);
					} else if(card.typeline.includes("Enchantment")){
						lengths[2]++;
						cards.Enchantments.push(card);
					} else if(card.typeline.includes("Artifact")){
						lengths[3]++;
						cards.Artifacts.push(card);
					} else if(card.typeline.includes("Instant")){
						lengths[4]++;
						cards.Instants.push(card);
					} else if(card.typeline.includes("Sorcery")){
						lengths[5]++;
						cards.Sorceries.push(card);
					} else if(card.typeline.includes("Planeswalker")){
						lengths[6]++;
						cards.Planeswalkers.push(card);
					} 
				});
				cards.Lands.objSort("name");
				cards.Creatures.objSort("name");
				cards.Enchantments.objSort("name");
				cards.Artifacts.objSort("name");
				cards.Instants.objSort("name");
				cards.Sorceries.objSort("name");
				cards.Planeswalkers.objSort("name");
			}
			if(sort == "color"){
				types = ["Colorless", "White", "Blue", "Black", "Red", "Green", "DuoColor", "TriColor", "Other"];
				types.forEach(function(type){
					lengths.push(0);
					cards[type] = [];
				});
				
				foundDeck.cards.forEach(function(card){
					if(card.colors.length < 1){
						lengths[0]++;
						cards.Colorless.push(card);
					} else if(card.colors.length == 1){
						if(card.colors[0] == "W"){
							lengths[1]++;
							cards.White.push(card);
						} else if(card.colors[0] == "U"){
							lengths[2]++;
							cards.Blue.push(card);
						} else if(card.colors[0] == "B"){
							lengths[3]++;
							cards.Black.push(card);
						} else if(card.colors[0] == "R"){
							lengths[4]++;
							cards.Red.push(card);
						} else if(card.colors[0] == "G"){
							lengths[5]++;
							cards.Green.push(card);
						}
					} else if(card.colors.length == 2){
						lengths[6]++;
						cards.DuoColor.push(card);
					} else if(card.colors.length == 3){
						lengths[7]++;
						cards.TriColor.push(card);
					} else if(card.colors.length > 3){
						lengths[8]++;
						cards.Other.push(card);
					} 
				});
				cards.Colorless.objSort("name");
				cards.White.objSort("name");
				cards.Blue.objSort("name");
				cards.Black.objSort("name");
				cards.Red.objSort("name");
				cards.Green.objSort("name");
				cards.DuoColor.objSort("name");
				cards.TriColor.objSort("name");
				cards.Other.objSort("name");
			}
			if(sort == "cmc"){
				types = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven"];
				types.forEach(function(type){
					lengths.push(0);
					cards[type] = [];
				});
				for(var i = 0; i < 11; i++){
					foundDeck.cards.forEach(function(card){
						if(card.cmc == i){
							lengths[i]++;
							var word = numberToWords.toWords(i);
							word = word.charAt(0).toUpperCase() + word.slice(1);
							cards[word].push(card);
						}
					});
				}
				foundDeck.cards.forEach(function(card){
					if(card.cmc > 10){
						lengths[11]++;
						cards.Eleven.push(card);
					}
				});
				for(var i = 0; i < 12; i++){
					var word = numberToWords.toWords(i);
					word = word.charAt(0).toUpperCase() + word.slice(1);
					cards[word].objSort("name");
				}
			}
			for(var i = 0; i < lengths.length; i++){
				var highest = Math.max.apply(null, lengths);
				var index = lengths.indexOf(highest);
				lengths.splice(index, 1, null);
				if(highest != 0){
					typesOrdered.push(types[index]);
					lengthsOrdered.push(highest);
				}				
			}
			
			foundDeck.cardsWishlist.objSort("name");
			foundDeck.cardsToBuy.objSort("name");
			// sort cards alphabettically 
			
			var tempTokens = [];
			foundDeck.cards.forEach(function(card){
				if(card.tokens.length != 0){
					card.tokens.forEach(function(token){
						tempTokens.push(token.name);
					});
				} 
			});
			Card.find({ name: { $in: tempTokens}}, function(err, results){
				if(err){
					console.log(err);
				} else {
					results.forEach(function(result){
						deckTokens.push(result);
					});
					
					res.render(render, {deck: foundDeck, cards: cards, page: page, types: typesOrdered, lengths: lengthsOrdered, sort: sort, tokens: deckTokens});	
				}
			});
		}
	});
}

module.exports = router;