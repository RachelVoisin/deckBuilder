function getGraphs(id){
	
	var data = {id: id};
	var url = "/graphs";

	$.ajax({
		type: "GET",
		url: url,
		data: data,
		success: function(result){ 
	
			var ctx = document.getElementById('manaChart').getContext('2d');
			var manaChart = new Chart(ctx,{
				type: 'doughnut',
				data: {
					labels: ["Plains", "Island", "Swamp", "Mountain", "Forest"],
					datasets: [{
						backgroundColor: [
							"#eeeded",
							"#2185d0",
							"#1b1c1d",
							"#db2828",
							"#21ba45"
						],
						borderColor: '#D3D3D3',
						borderWidth: 1,
						data: result.cardMana
					},
					{
						backgroundColor: [
							"#eeeded",
							"#2185d0",
							"#1b1c1d",
							"#db2828",
							"#21ba45"
						],
						borderColor: '#D3D3D3',
						borderWidth: 1,
						data: result.landMana,
					}],
				},
				options: {
					tooltips: {
						displayColors: false
					},
					legend: {
						display: false
					},
					title: {
						display: true,
						text:'Mana'
					},
					plugins: {
						labels: {
							render: 'image'
						}
					},
					aspectRatio: 1,
				},
			});
			
			var ctx = document.getElementById('typeChart').getContext('2d');
			var typeChart = new Chart(ctx,{
				type: 'doughnut',
				data: {
					labels: ["Land", "Creature", "Enchantment", "Artifact", "Instant", "Sorcery", "Planeswalker"],
					datasets: [{
						backgroundColor: [
							"#cd333b", 
							"#f8c768", 
							"#90aa6d", 
							"#70ccb7", 
							"#9de8e4",
							"#6ca5c3",
							"#916fa2"
						],
						borderColor: '#D3D3D3',
						borderWidth: 1,
						data: result.type
					}],
				},
				options: {
					tooltips: {
						displayColors: false
					},
					legend: {
						display: false
					},
					title: {
						display: true,
						text: 'Types'
					},
					plugins: {
						labels: {
							render: 'label',
							position: 'outside'
						}
					},
					aspectRatio: 1.2,
				},
			});
			
			var ctx = document.getElementById('cmcChart').getContext('2d');
			var myBarChart = new Chart(ctx, {
				type: 'bar',
				data: {
					labels: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "10+"],
					datasets: [{
						backgroundColor: "#6ca5c3",
						borderColor: '#6c7877',
						borderWidth: 1,
						data: result.cmc
					}]
				},
				options: {
					tooltips: {
						enabled: true,
						titleFontSize: 0,
						displayColors: false
					},
					legend: {
						display: false
					},
					title: {
						display: true,
						text: 'Converted Mana Cost'
					},
					plugins: {
						labels: {
							render: 'image'
						}
					},
					aspectRatio: 1.2,
				},
			});
		},
		error:function (jXHR, textStatus, errorThrown){
			console.log(errorThrown);
			console.log(textStatus);
			console.log(jXHR);
		},
		dataType: "JSON"
	});
}