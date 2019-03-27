var mongoose = require("mongoose");
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

var Card = require("./models/card");
var Deck = require("./models/deck");
var User = require("./models/user");
var CardsArray = require("./models/cardsArray");
var Token = require("./models/token");

function seedDB(){
	console.log('Now seeding DB...');
	//removeUsers();
	//removeDecks(); 
	
	// DO NOT REMOVE USERS WITHOUT REMOVING DECKS
	
	// DO NOT REMOVE CARDS WITHOUT REMOVING DECKS
	
	//removeCards();
	
	//updateTokens();
	//updateCards('https://archive.scryfall.com/json/scryfall-oracle-cards.json');
	//updateCardsArray();
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
			console.log("removed cards");
		}
	});
}
function updateTokens(){
	Token.remove({}, function(err){
		if(err){
			console.log(err);
		} else{
			console.log("removed tokens");
		}
	});
	getTokens("https://api.scryfall.com/cards/search?q=%2B%2Bis%3Atoken");
}
function getTokens(url){
	var request = new XMLHttpRequest();
	request.onreadystatechange = function () {
		if (request.readyState === 4 && request.status === 200) {
			var response = JSON.parse(request.responseText);
			var tokens = response.data;
			tokens.forEach(function(token){
				if(token.image_uris){
					var newToken = new Token({
						name: token.name,
						image: token.image_uris.normal,
						scryfallid: token.id
					});
					Token.create(newToken, function(err, newlyCreated){
						if(err){
							console.log(err);
						} 
					});		
				}
			});
			if(response.has_more){
				setTimeout(function(){
					getTokens(response.next_page);
				}, 500);
			} else {
				console.log("added all tokens from scryfall");
			}
		}
	};
	request.open('GET', url);
	request.send();
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
				if(!currentCards.includes(card.oracle_id) && !card.type_line.includes("Token")){
					var newCard = new Card({
						name: card.name,
						typeline: card.type_line,
						oracleid: card.oracle_id,
						scryfallid: card.id,
						colors: card.color_identity,
						cmc: card.cmc
					});
					if(card.image_uris){
						newCard.image = card.image_uris.normal;
						newCard.flip = false;
					} else if(card.card_faces) {
						newCard.image = card.card_faces[0].image_uris.normal;
						newCard.flip = true;
						newCard.flipimage = card.card_faces[1].image_uris.normal;
					}
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
					if(card.image_uris){
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
function updateCardsArray(){
	CardsArray.remove({}, function(err){
		if(err){
			console.log(err);
		}
		else {
			console.log('removed card array');
			var data = [];
			Card.find({}, function(err, allCards){
				if(err){
					console.log(err);
				} else {
					allCards.forEach(function(card){
						data.push(card.name);
					});
					var newCardsArray = new CardsArray({
						cards: data
					});
					CardsArray.create(newCardsArray, function(err, newlyCreated){
						if(err){
							console.log(err);
						} else {
							console.log("new array added");
						}
					});		
				}
			});
		}
	});
}
	
module.exports = seedDB;