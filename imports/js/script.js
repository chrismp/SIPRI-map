// http://wiki.openstreetmap.org/wiki/Slippy_map_tilenames  FOR MORE BASEMAP TILES

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
			$('#ex1').on('slide',function(slideEvent){
				var year = slideEvent.value;
				$('#ex6SliderVal').text(year);
				layer.getSubLayer(0).setSQL("SELECT * FROM "+cartoDbTableName+" WHERE (importyear"+year+">0 AND gwsyear<="+year+" AND gwsyear>0)");
				layer.getSubLayer(0).setCartoCSS(
					"#sipri_import_export_map_1950_2014{" +
					  "polygon-fill: #dddddd;" +
					  "polygon-opacity: 1;" +
					  "line-color: #FFF;" +
					  "line-width: 0.5;" +
					  "line-opacity: 1;" +
					"}" +
					"#sipri_import_export_map_1950_2014 [ importyear"+year+" > 1000] {" +
					   "polygon-fill: #B10026;" +
					"}" +
					"#sipri_import_export_map_1950_2014 [ importyear"+year+" <= 1000] {" +
					   "polygon-fill: #E31A1C;" +
					"}" +
					"#sipri_import_export_map_1950_2014 [ importyear"+year+" <= 800] {" +
					   "polygon-fill: #FC4E2A;" +
					"}" +
					"#sipri_import_export_map_1950_2014 [ importyear"+year+" <= 600] {" +
					   "polygon-fill: #FD8D3C;" +
					"}" +
					"#sipri_import_export_map_1950_2014 [ importyear"+year+" <= 400] {" +
					   "polygon-fill: #FEB24C;" +
					"}" +
					"#sipri_import_export_map_1950_2014 [ importyear"+year+" <= 200] {" +
					   "polygon-fill: #FED976;" +
					"}" +
					"#sipri_import_export_map_1950_2014 [ importyear"+year+" <= 20] {" +
					   "polygon-fill: #FFFFB2;" +
					"}"
				);
				layer.getSubLayer(0).setInteraction(true);
				layer.getSubLayer(0).infowindow.set('template', $('#infowindow-template').html());
				layer.getSubLayer(0).on('mouseover', function(e,latlng,pos,data){
					console.log(data);
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
	rangeLow.innerHTML = '$20,000 or less';
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
};