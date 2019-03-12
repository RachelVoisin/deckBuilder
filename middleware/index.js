// middleware index file

var middlewareObj = {};

var Deck = require("../models/deck");

middlewareObj.checkDeckOwnership = function(req, res, next){
	if(req.isAuthenticated()){
		Deck.findById(req.params.id, function(err, foundDeck){
			if(err){
				res.redirect("back");
			} else { 
				if(foundDeck.author.id.equals(req.user._id)) { 
					next();
				} else {
					req.flash("error", "Permission Denied.");
					res.redirect("back");
				}
			}
		});
	} else {
		req.flash("error", "You must be logged in to do that.");
		res.redirect("back");
	}
}

middlewareObj.checkWishOwnership = function(req, res, next){
	if(req.isAuthenticated()){
		Wish.findById(req.params.id, function(err, foundWish){
			if(err){
				res.redirect("/wishlist");
			} else { 
				if(foundWish.author.id.equals(req.user._id)) { 
					next();
				} else {
					req.flash("error", "Permission Denied.");
					res.redirect("back");
				}
			}
		});
	} else {
		req.flash("error", "You must be logged in to do that.");
		res.redirect("/wishlist");
	}
}

middlewareObj.isLoggedIn = function(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	req.flash("error", "You must be logged in to do that.");
	res.redirect("back");
}

module.exports = middlewareObj;