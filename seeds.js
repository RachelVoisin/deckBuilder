var mongoose = require("mongoose");
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

var Card = require("./models/card");
var Deck = require("./models/deck");
var User = require("./models/user");

function seedDB(){
	//removeUsers();
	//removeDecks(); 
	
	// DO NOT REMOVE USERS WITHOUT REMOVING DECKS
	
	//updateCards('https://archive.scryfall.com/json/scryfall-oracle-cards.json');
}

function removeUsers(){
	User.remove({}, function(err){
		if(err){
			console.log(err);
		}
		else {
			console.log("removed users");
		}
	});
}

function removeDecks(){
	Deck.remove({}, function(err){
		if(err){
			console.log(err);
		} else{
			console.log("removed decks");
		}
	});
}
	
function updateCards(url) {
	var myArray = [];
	var request = new XMLHttpRequest();
	request.onreadystatechange = function () {
		if (request.readyState === 4 && request.status === 200) {
			var cards = JSON.parse(request.responseText);
			for(var i = 0; i < cards.data.length; i++){
				if(cards.data[i].lang === "en" && cards.data[i].image_uris){
					if(!myArray.includes(cards.data[i].name)){
						myArray.push(cards.data[i].name);
						var type = "";
						var typeLine = cards.data[i].type_line;
								
						if(typeLine.includes("Creature")){
							type = "Creature";
						} else if(typeLine.includes("Land")) {
							type = "Land";
						} else if(typeLine.includes("Sorcery")) {
							type = "Sorcery";
						} else if(typeLine.includes("Instant")) {
							type = "Instant";
						} else if(typeLine.includes("Enchantment")) {
							type = "Enchantment";
						} else if(typeLine.includes("Planeswalker")) {
							type = "Planeswalker";
						} else {
							type = "Artifact";
						}

						var newCard = new Card({
							name: cards.data[i].name,
							image: cards.data[i].image_uris.normal,
							type: type,
							multiverseid: cards.data[i].multiverse_ids[0]
						});
							
							Card.create(newCard, function(err, newlyCreated){
							if(err){
								console.log(err);
							} 
						});			
					}	
				}
			}
			console.log("Added all cards from Scryfall");
		}
	};
	request.open('GET', url);
	request.send();
}
	
module.exports = seedDB;