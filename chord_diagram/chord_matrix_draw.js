      //*******************************************************************
      //  CREATE MATRIX AND MAP
      //*******************************************************************
      d3.csv(csv, function (error, data) {
        var mpr = chordMpr(data);
		//console.log("this is the csv you are visualizing:"+csv)
        mpr
          .addValuesToMap('term1')
          .setFilter(function (row, a, b) {
            return (row.term1 === a.name && row.term2 === b.name)
          })
          .setAccessor(function (recs, a, b) {
            if (!recs[0]) return 0;
            return +recs[0].count;
          });
        drawChords(mpr.getMatrix(), mpr.getMap(), data);
		d3.select(".foodsTab").attr("color", "#ffaaff")
		d3.select("#map").style("visibility", "hidden")
		d3.select("#foods").style("visibility", "visible")
		d3.select("#cuisines").style("visibility", "hidden") 
		//drawMap( data)
      });
	  
	function showRestaurants(){
		d3.select("#map").style("visibility", "visible")
		d3.select("#foods").style("visibility", "hidden") 
		//d3.select("#cuisines").style("visibility", "hidden") 
	}
	function showFoods(){
		d3.select("#map").style("visibility", "hidden") 
		d3.select("#foods").style("visibility", "visible")
		//d3.select("#cuisines").style("visibility", "hidden") 
	}	  
	function showCuisines(){
		d3.select("#map").style("visibility", "hidden") 
		d3.select("#foods").style("visibility", "hidden") 
		d3.select("#cuisines").style("visibility", "visible")
	}
	  function formatData(data){
		  var foodsDictionary ={}
		  var restaurantsDictionary ={}
		  var cuisinesDictionary ={}
		  var coordinatesDictionary ={}
		  
		  for(var i in data){
			  var terms = [data[i].term1, data[i].term2]
			  var foods = data[i].foods
			  var restaurants = data[i].restaurant
			  var cuisines = data[i].type
			  var coordinates = data[i].coordinates
			  //console.log(restaurants, cuisines, coordinates)
			  foodsDictionary[terms] = foods
			  restaurantsDictionary[terms] = restaurants
			  cuisinesDictionary[terms] = cuisines
			  coordinatesDictionary[terms] = coordinates
		  }
		  //console.log(foodsDictionary)
		  return [foodsDictionary, restaurantsDictionary, coordinatesDictionary, cuisinesDictionary]
	  }
      //*******************************************************************
      //  DRAW THE CHORD DIAGRAM
      //*******************************************************************
      function drawChords (matrix, mmap, data) {
		 
		 // console.log(restaurantsDictionary)
		var foodsDictionary = formatData(data)[0]
		var restaurantsDictionary = formatData(data)[1]
		var cuisinesDictionary = formatData(data)[3]
		var coordinatesDictionary = formatData(data)[2]
		//console.log(coordinatesDictionary)
		
        var w =650, h = 650, r1 = h / 2, r0 = r1 - 70;
		var totalMenuItems = 58255
        var fill = d3.scale.ordinal()
            .domain(d3.range(10))
            .range(["#9ACB48","#849769","#52DC8F","#67DE34","#92D09B","#6D9641","#49A32E","#5FDA67","#4DA268","#A4CE7A"]);
        
        var chord = d3.layout.chord()
            .padding(.02)
            .sortGroups(d3.descending)
            .sortChords(d3.descending);

        var arc = d3.svg.arc()
            .innerRadius(r0)
            .outerRadius(r0 + 1);

        var svg = d3.select("#container").append("svg:svg")
            .attr("width", w)
            .attr("height", h)
          .append("svg:g")
            .attr("id", "circle")
            .attr("transform", "translate(" + w / 2 + "," + h / 2 + ")");

            svg.append("circle")
                .attr("r", r0 + 5);

        var rdr = chordRdr(matrix, mmap);
        chord.matrix(matrix);
		var opacityScale = d3.scale.sqrt().domain([0,.4]).range([0.2,.5])
		var fontScale = d3.scale.sqrt().domain([0,25000]).range([6,14])
		
        var g = svg.selectAll("g.group")
            .data(chord.groups())
          .enter().append("svg:g")
            .attr("class", "group")
            .on("mouseover", mouseover)
            .on("mouseout", function (d) { d3.select("#tooltip").style("visibility", "hidden") });
		
		g.append("svg:path")
            .style("stroke", "none")
            .style("fill", function(d) { 
				//return "#aaa"
				return fill(d.index); 
			})
			//.style("opacity", function(d){return opacityScale(d.value)})
            .attr("d", arc);

        g.append("svg:text")
            .each(function(d) { d.angle = (d.startAngle + d.endAngle) / 2; })
            .attr("dy", ".35em")
            .style("font-family", "helvetica, arial, sans-serif")
            .style("font-size", function(d){return fontScale(d.value)})
            .attr("text-anchor", function(d) { 
				return d.angle > Math.PI ? "end" : null; })
            .attr("transform", function(d) {
              return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
                  + "translate(" + (r0 +8) + ")"
                  + (d.angle > Math.PI ? "rotate(180)" : "");
            })
            .text(function(d) { return rdr(d).gname; });

          var chordPaths = svg.selectAll("path.chord")
                .data(chord.chords())
              .enter().append("svg:path")
                .attr("class", "chord")
               .style("stroke", function(d) {return fill(d.index); return "#ddd" })
                .style("fill", function(d) { 
					return fill(d.source.index); 
					//return "#000"
				})
                .attr("d", d3.svg.chord().radius(r0))
                .on("mouseover", function (d,i) {					
                  d3.select("#tooltip")
                    .style("visibility", "visible")
                    .html(chordTip(rdr(d)))
                    //.style("top", function () { return (d3.event.pageY - 20)+"px"})
                    //.style("left", function () { return (d3.event.pageX - 100)+"px";})
                })
				.on("click", function (d,i) {					
                  d3.select("#tooltip")
                    .style("visibility", "visible")
                    .html(chordTip(rdr(d)))
					 })
			//	.style("opacity", function(d){return opacityScale(d.target.value)})
                //.on("mouseout", function (d) { d3.select("#tooltip").style("visibility", "hidden") });

				function formatRestaurantsList(input){
					input = input.split(",")
					var inputLength = input.length
					var output = ""
					for(var i =0; i<input.length; i++){
						output = output+"<span style=\"color:"+fill(i)+"\">"+input[i].replace("\'", "").replace("\'", "").replace("[", "").replace("]", "")+"</span></br>"
					}
					return output
				}
				function formatFoodsList(input){
					input = input.split(",")
					var inputLength = input.length
					var output = ""
					for(var i =0; i<input.length; i++){
						var shortenedName = input[i].split(" ").slice(0, 10);
						var shortenedName = shortenedName.join(" ");
						output = output+"<span style=\"color:"+fill(i)+"\">"+shortenedName.replace("\'", "").replace("\'", "").replace("[", "").replace("]", "")+"</span></br>"
					}
					return output
				}
          function chordTip (d) {
  			//console.log(d)			  
            var p = d3.format(".2%"), q = d3.format(",.3r")
			//console.log(restaurantsDictionary[[d.sname, d.tname]])
			var foodsLength = (foodsDictionary[[d.sname, d.tname]]).split("\', \'").length
			var restaurantsLength = (restaurantsDictionary[[d.sname, d.tname]]).split("\'").length
			//console.log(foodsDictionary[[d.sname, d.tname]])
			//d3.select("#restaurants").html(foodsLength + " foods from " + restaurantsLength+ " restaurants")
			//d3.select("#foods").html()
			d3.select("#map").html(formatRestaurantsList(restaurantsDictionary[[d.sname, d.tname]]))
			//d3.select("#foods").html(formatFoodsList(foodsDictionary[[d.sname, d.tname]]))
	  	  	d3.select("#foods").html(formatFoodsList(foodsDictionary[[d.sname, d.tname]]))
	  	  	//d3.select("#cuisines").html(formatFoodsList(cuisinesDictionary[[d.sname, d.tname]]))
			//	drawMap(coordinatesDictionary[[d.sname, d.tname]])
            return p(d.svalue/d.stotal) + " of menu items containing "+ d.sname 
               + " also contains " + d.tname + "</br>They can be found in "+ foodsLength + " dishes from " + restaurantsLength+ " Restaurants"
			  
			 // + (d.sname === d.tname ? "": ("<br/>while...<br/>"
             // + p(d.tvalue/d.ttotal) + " (" + q(d.tvalue) + ") of "
             // + d.tname + " also has " + d.sname
		  //))
          }

          function groupTip (d) {
            var p = d3.format(".1%"), q = d3.format(",.3r")
			//console.log(d)
            return ""
			//return  p(d.gvalue/totalMenuItems)+" or "+ q(d.gvalue) +" items has "+ d.gname 
               // + p(d.gvalue/d.mtotal) + " of Matrix Total (" + q(d.mtotal) + ")"
          }

          function mouseover(d, i) {
            d3.select("#tooltip")
              .style("visibility", "visible")
              .html(groupTip(rdr(d)))
              //.style("top", function () { return (d3.event.pageY - 20)+"px"})
              //.style("left", function () { return (d3.event.pageX - 130)+"px";})
             chordPaths.classed("fade", function(p) {
              return p.source.index != i
                  && p.target.index != i;
            });
          }
      }

	  function drawMap(data){
		  console.log("draw map")
  	  	var map = d3.select("#map")
				.append("svg")
				.attr('height', 400)
				.attr('width',400);
		var projection = d3.geo.mercator()
						.center([ -71.101191, 42.369360])
						.scale(6000);
		var path = d3.geo.path().projection(projection);
		
		d3.json("cambridge_boundary.geojson", function(error, cambridge) {
		  if (error) return console.error(error);
		  map.append("path")
  			.data(cambridge.features)
			.enter()
			.append('path')
			.attr('class', 'borough')
			.attr('fill', 'black')
			.attr('stroke', 'black')
			.attr('stroke-opacity', 0.1)
			.attr('d', path)
		});
		
		
		
		
		//console.log(data)
	  }