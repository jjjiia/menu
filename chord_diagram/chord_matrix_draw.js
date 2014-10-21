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
      });
      //*******************************************************************
      //  DRAW THE CHORD DIAGRAM
      //*******************************************************************
      function drawChords (matrix, mmap, data) {
		  var foodsDictionary ={}
		  var restaurantsDictionary ={}
		  for(var i in data){
			  var terms = [data[i].term1, data[i].term2]
			  var foods = data[i].foods
			  var restaurants = data[i].restaurants
			  foodsDictionary[terms] = foods
			  restaurantsDictionary[terms] = restaurants
		  }
		 // console.log(restaurantsDictionary)

        var w =650, h = 650, r1 = h / 2, r0 = r1 - 70;
		var totalMenuItems = 58255
        var fill = d3.scale.ordinal()
            .domain(d3.range(7))
            .range(["#A0CE51","#658C5F","#5CDE8C","#77E63A","#AEDA94","#518934","#58C74A"]);
        
        var chord = d3.layout.chord()
            .padding(.02)
            .sortGroups(d3.ascending)
            .sortChords(d3.ascending);

        var arc = d3.svg.arc()
            .innerRadius(r0)
            .outerRadius(r0 + 5);

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
                  + "translate(" + (r0 +7) + ")"
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
			//	.style("opacity", function(d){return opacityScale(d.target.value)})
                .on("mouseout", function (d) { d3.select("#tooltip").style("visibility", "hidden") });

				function formatFoodsList(input){
					input = input.split(",")
					var inputLength = input.length
					var output = ""
					for(var i in input){
						output = output+input[i]+"</br>"
					}
					return output
				}

          function chordTip (d) {
  			//console.log(d)			  
            var p = d3.format(".2%"), q = d3.format(",.3r")
			//console.log(restaurantsDictionary[[d.sname, d.tname]])
			var foodsLength = (foodsDictionary[[d.sname, d.tname]]).split(",").length
			var restaurantsLength = (restaurantsDictionary[[d.sname, d.tname]]).split(",").length
			
			//d3.select("#restaurants").html(foodsLength + " foods from " + restaurantsLength+ " restaurants")
			//d3.select("#foods").html()
			d3.select("#restaurants").html(formatFoodsList(restaurantsDictionary[[d.sname, d.tname]]))
			d3.select("#foods").html(formatFoodsList(foodsDictionary[[d.sname, d.tname]]))
			
            return p(d.svalue/d.stotal) + " of menu items containing "+ d.sname 
               + " also contains " + d.tname + "</br>"+ foodsLength + " dishes from " + restaurantsLength+ " restaurants"
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
