// http://wiki.openstreetmap.org/wiki/Slippy_map_tilenames  FOR MORE BASEMAP TILES

function numberWithCommas(x) {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function makeTooltip(layer,data,dataType,year){
	for (var i = 0; i < $('.cartodb-tooltip').length; i++) {
		if(i!=1){
			$('.cartodb-tooltip')[i].remove();
		}	
	}
	
	var yearString = dataType+year;
	var tooltipInfoArray = [
		data.cntry_name,
		data[yearString]
	];
	var tooltipHTML = tooltipInfoArray.map(function(elem,idx){
		// var suffix = elem.length > 3 ? 'b' : 'm'; // If `elem` is longer than three, it's a number like 1000, or $1 billion.
		var txt;
		if(idx===0){
			txt = '<b>'+elem+'</b>';
		} else {
			elem = elem*1000000
			// var suffix  = elem < 1000000000 ? 'm' : 'b';
			txt = 'Weapons exports: $'+numberWithCommas(elem);
		}
		// var txt = idx===0 ? '<b>'+elem+'</b>' : 'Weapons exports: $'+numberWithCommas(elem)+'m';
		return '<p>'+txt+'</p>';
	}).join('');

	tooltip = new cdb.geo.ui.Tooltip({
	    layer: layer,
	    template: tooltipHTML, 
	    width: 200,
	    position: 'bottom|right'
	});
					
	$('body').append(tooltip.render().el);
}

window.onload = function(){
	var cartoDbTableName = 'sipri_import_export_map_1950_2014';
	var domId = 'map';
	var mapStyle = document.getElementsByClassName('map-style');
	var lat = 0;
	var lon = 0;
	var zoomLvl = 2;
	var options = {
		center: [lat,lon],
		zoom: zoomLvl
	};
	var mapObject = new L.Map(domId,options);
	var layerSource = {
		user_name: 'chrismp',
		type: 'cartodb',
		sublayers: [
			{
				sql: "SELECT * FROM "+cartoDbTableName+" WHERE (gwsyear <= 1950 AND gwsyear > 0)",
				cartocss: mapStyle[0].innerHTML
			}
		]
	};


	$('#ex1').slider();

	L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
		.addTo(mapObject);

	cartodb.createLayer(mapObject,layerSource)
		.addTo(mapObject)
		.on('done',function(layer){
			var tooltip;
			var sublayer = layer.getSubLayer(0);
			sublayer.setInteraction(true);
			sublayer.setInteractivity('cntry_name, exportyear1950');
			sublayer.on('featureOver', function(e, latlng, pos, data, subLayerIndex) {
				makeTooltip(layer,data,'exportyear',1950);
			}).on('error',function(err){
				console.log('Error featureOver: '+err);
			});
			
			sublayer.on('featureOut',function(e, latlng, pos, data, subLayerIndex){
				$('.cartodb-tooltip').remove();
			}).on('error',function(err){
				console.log('Error featureOut: '+err);
			});

			$('#ex1').on('slide',function(slideEvent){
				var year = slideEvent.value;
				$('#ex6SliderVal').text(year);
				sublayer.setSQL("SELECT * FROM "+cartoDbTableName+" WHERE (exportyear"+year+">0 AND gwsyear<="+year+" AND gwsyear>0)");
				sublayer.setCartoCSS(
					"#sipri_import_export_map_1950_2014{" +
					  "polygon-fill: #dddddd;" +
					  "polygon-opacity: 1;" +
					  "line-color: #FFF;" +
					  "line-width: 0.5;" +
					  "line-opacity: 1;" +
					"}" +
					"#sipri_import_export_map_1950_2014 [ exportyear"+year+" > 1000] {" +
					   "polygon-fill: #B10026;" +
					"}" +
					"#sipri_import_export_map_1950_2014 [ exportyear"+year+" <= 1000] {" +
					   "polygon-fill: #E31A1C;" +
					"}" +
					"#sipri_import_export_map_1950_2014 [ exportyear"+year+" <= 800] {" +
					   "polygon-fill: #FC4E2A;" +
					"}" +
					"#sipri_import_export_map_1950_2014 [ exportyear"+year+" <= 600] {" +
					   "polygon-fill: #FD8D3C;" +
					"}" +
					"#sipri_import_export_map_1950_2014 [ exportyear"+year+" <= 400] {" +
					   "polygon-fill: #FEB24C;" +
					"}" +
					"#sipri_import_export_map_1950_2014 [ exportyear"+year+" <= 200] {" +
					   "polygon-fill: #FED976;" +
					"}" +
					"#sipri_import_export_map_1950_2014 [ exportyear"+year+" <= 20] {" +
					   "polygon-fill: #FFFFB2;" +
					"}");
				
				sublayer.setInteractivity('cntry_name, exportyear'+year);
				
				sublayer.on('featureOver', function(e, latlng, pos, data, subLayerIndex) {
					makeTooltip(layer,data,'exportyear',year);
				}).on('error',function(err){
					console.log('Error: '+err);
				});

				sublayer.on('featureOut',function(e, latlng, pos, data, subLayerIndex){
					$('.cartodb-tooltip').remove();
				}).on('error',function(err){
					console.log('Error featureOut: '+err);
				});
			});
		}).on('error',function(err){
			console.log(err);
		});

	var legendWrapper = document.getElementById('legend-wrapper');
	var rangeLow = document.createElement('span');
	var rangeHigh = document.createElement('span');
	var legendColorArray = [
		'B10026',
		'E31A1C',
		'FC4E2A',
		'FD8D3C',
		'FEB24C',
		'FED976',
		'FFFFB2'
	];

	rangeLow.className = 'legend-range';
	rangeHigh.className = 'legend-range';
	rangeLow.innerHTML = '$20 million or less';
	rangeHigh.innerHTML = 'More than $1 billion';

	legendWrapper.appendChild(rangeHigh);

	for (var i=0; i<legendColorArray.length; i++) {
		var hexColor = '#'+legendColorArray[i];
		legendColorDiv = document.createElement('div');
		legendColorDiv.className = 'legend-color';
		legendColorDiv.style.backgroundColor = hexColor;
		legendWrapper.appendChild(legendColorDiv);
		$('#legend-wrapper').append('<div class="legend-color"></div>');
	}

	legendWrapper.appendChild(rangeLow);

	var note = document.createElement('div');
	note.innerHTML = 'All figures in 2014 inflation-adjusted U.S. dollars.';
	legendWrapper.appendChild(note);
};