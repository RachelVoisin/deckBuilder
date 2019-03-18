var mongoose = require("mongoose");
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

var Card = require("./models/card");
var Deck = require("./models/deck");
var User = require("./models/user");

function seedDB(){
	console.log('Now seeding DB...');
	//removeUsers();
	//removeDecks(); 
	
	// DO NOT REMOVE USERS WITHOUT REMOVING DECKS
	
	// DO NOT REMOVE CARDS WITHOUT REMOVING DECKS
	
	//removeCards();
	
	//updateCards('https://archive.scryfall.com/json/scryfall-oracle-cards.json');
}

function removeUsers(){
	User.remove({}, function(err){
		if(err){
			console.log(err);
		}
		else {
			console.log('removed users');
		}
	});
}

function removeDecks(){
	Deck.remove({}, function(err){
		if(err){
			console.log(err);
		} else{
			console.log('removed decks');
		}
	});
}

function removeCards(){
	Card.remove({}, function(err){
		if(err){
			console.log(err);
		} else{
			console.log('removed cards');
		}
	});
}
	
function updateCards(url) {
	var currentCards = [];
	Card.find({}, function(err, allCards){
		if(err){
			console.log(err);
		} else {
			allCards.forEach(function(card){
				currentCards.push(card.oracleid);
			});
		}
	});
	
	var request = new XMLHttpRequest();
	request.onreadystatechange = function () {
		if (request.readyState === 4 && request.status === 200) {
			var cards = JSON.parse(request.responseText);
			cards.forEach(function(card){
				if(card.image_uris){
					if(!currentCards.includes(card.oracle_id)){
						var newCard = new Card({
							name: card.name,
							image: card.image_uris.normal,
							typeline: card.type_line,
							oracleid: card.oracle_id,
							scryfallid: card.id,
							colors: card.color_identity,
							cmc: card.cmc
						});
						if(card.all_parts && card.all_parts.length > 0){
							var tokens = [];
							card.all_parts.forEach(function(part){
								if(part.component && part.component == "token"){
									var token = {
										name: part.name,
										scryfallid: part.id
									};
									tokens.push(token);
								}
							});
							if(tokens.length > 0){
								newCard.tokens = tokens;
							}
						}
						Card.create(newCard, function(err, newlyCreated){
							if(err){
								console.log(err);
							} 
						});		
					} else {
						Card.updateOne({ oracleid: card.oracle_id }, { image: card.image_uris.normal });
					}
				}
			});
			console.log("Added all cards from Scryfall");
		}
	};
	request.open('GET', url);
	request.send();
}
	
module.exports = seedDB;