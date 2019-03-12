var express = require("express");
var router = express.Router();

var objSort = require("../public/scripts/objSort");

var User = require("../models/user"),
    Deck = require("../models/deck"),
	Card = require("../models/card");

var middleware = require("../middleware");

// WISHLIST home
router.get("/wishlist", function(req, res){
	var page = "wishlist";
	User.find({}, function(err, allUsers){
		if(err){
			console.log(err);
		} else {
			Deck.find().populate("cardsWishlist").exec(function(err, allDecks){
				// add buylist cards here too!
				if(err){
					console.log(err);
				} else {
					var wishedCards = [];
					allDecks.forEach(function(deck){
						for(var i = 0; i < deck.cardsWishlist.length; i++){
							var wishedCard = {
								userName: deck.author.username,
								cardName: deck.cardsWishlist[i].name,
								cardImage: deck.cardsWishlist[i].image,
								deck: deck._id
								// use ID to allow click through to relevant deck
							};
							wishedCards.push(wishedCard);
						}
					});
					res.render("wishlist/index", {cards: wishedCards, users: allUsers, page: page});
				}
			});
		}
	});
});

module.exports = router;