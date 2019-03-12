var express = require("express");
var router = express.Router();

var objSort = require("../public/scripts/objSort");

var User = require("../models/user"),
    Deck = require("../models/deck"),
	Card = require("../models/card");

var middleware = require("../middleware"); // contents of index.js is automatically required if you require a directory

// MTG Home Page
router.get("/mtg", function(req, res){
	var page = "mtg";
	Deck.find().populate("cardsWishlist").exec(function(err, allDecks){
		if(err){
			console.log(err);
		} else {
			var wishedCards = [];
			allDecks.forEach(function(deck){
				for(var i = 0; i < deck.cardsWishlist.length; i++){
					var wishedCard = {
						userName: deck.author.username,
						cardName: deck.cardsWishlist[i].name
					};
					wishedCards.push(wishedCard);
				}
			});
			res.render("mtg/index", {decks: allDecks, cards: wishedCards, page: page}); // wished cards aren't being used
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

// Add Card to Deck 
router.post("/mtg/:id", middleware.checkDeckOwnership, function(req, res){			
	Deck.findById(req.params.id, function(err, deck){
		if(err){
			req.flash("error", "Could not find deck");
			res.redirect("/mtg");
		} else {
			Card.findOne({ 'name' : req.body.name }, function(err, foundCard){
				if(err){
					console.log(err);
				} else if(!foundCard){
					req.flash("error", "Could not find card with that name.");
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

function renderCardList(req, res, render){
	var page = "mtg";
	Deck.findById(req.params.id)
	.populate("cards").populate("cardsWishlist").populate("cardsToBuy").populate("cardsCut")
	.exec(function(err, foundDeck){
		if(err){
			console.log(err);
			req.flash("error", "Could not find deck");
			res.redirect("/mtg");
		} else {
			var types = ["Creature", "Artifact", "Instant", "Sorcery", "Enchantment", "Planeswalker"];
			var typesOrdered = [];
			var lengthsOrdered = [];
			var lengths = [];
			types.forEach(function(type){
				var cardsOfType = 0;
				foundDeck.cards.forEach(function(card){
					if(card.type === type){
						cardsOfType++;
					}
				});
				lengths.push(cardsOfType);
			});
			for(i = 0; i < 6; i++){
				var highest = Math.max.apply(null, lengths);
				var index = lengths.indexOf(highest);
				lengths.splice(index, 1, null);
				if(highest != 0){
					typesOrdered.push(types[index]);
					lengthsOrdered.push(highest);
				}				
			}
			var images = {
				swamp: "https://img.scryfall.com/cards/normal/en/ust/214.jpg?1522209154",
				mountain: "https://img.scryfall.com/cards/normal/en/ust/215.jpg?1522209167",
				forest: "https://img.scryfall.com/cards/normal/en/ust/216.jpg?1522209177",
				plains: "https://img.scryfall.com/cards/normal/en/ust/212.jpg?1522209087",
				island: "https://img.scryfall.com/cards/normal/en/ust/213.jpg?1522209134",
			};
			var sortedCards = foundDeck.cards.objSort("name");
			var sortedWishlist = foundDeck.cardsWishlist.objSort("name");
			var sortedToBuy = foundDeck.cardsToBuy.objSort("name");
			// sort cards alphabettically 

			res.render(render, {deck: foundDeck, page: page, types: typesOrdered, lengths: lengthsOrdered, images: images});				
		}
	});
}

module.exports = router;