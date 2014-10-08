var global = {
	data:null,
	searchTerm:"tofu"
}
var topLevelDictionary = {};

$(function() {
	// Window has loaded
	queue()
		.defer(d3.text, csv)
		.await(dataDidLoad);
})
function dataDidLoad(error, data) {
	global.data = data
	//console.log(data)
	
	formatMenuIntoSentences(global.data.toLowerCase(), global.searchTerm)
	console.log(convertTree(topLevelDictionary)[0])
	drawChart(convertTree(topLevelDictionary)[0])
	//displayResults()
	//console.log()
	//draw(convertTree(topLevelDictionary))
	frm1.searchTerm.value = ""
	topLevelDictionary = {}
}

function displayResults(){
	var displaystring = JSON.stringify(convertTree(topLevelDictionary)[0], null, 2)
	d3.select("#output").html("<span style=\"color:red\">Showing results for: "+global.searchTerm+"</span></br></br><pre>"+displaystring+"</pre>")
	
}

function searchFor() {
    //document.getElementById("frm1").submit();
	enteredTerm = frm1.searchTerm.value
	d3.select("#output").html("")
	console.log("searched for", enteredTerm )
	if(frm1.searchTerm.value != ""){
		
		formatMenuIntoSentences(global.data.toLowerCase(), frm1.searchTerm.value)
		drawChart(convertTree(topLevelDictionary)[0])
		//displayResults()
	}
	//clear the input from form
	frm1.searchTerm.value = ""
	topLevelDictionary = {}
}


function insertWords(dictionary, words, searchTerm) {
  if (words.length === 0) {
    return;
  }
  //console.log(words)
  //isolate menu items with searchterm
  //find index of search term in array
	  var searchTermIndex = searchStringInArray(searchTerm, words)
	 // console.log(searchTermIndex)
	  
	  var firstWord = words[searchTermIndex].toLowerCase();
	  //console.log(firstWord)
	  
	  //slice off everything before searchTerm
	  var restOfWords = words.slice(searchTermIndex+1);
	  //console.log(restOfWords)
	  
	  var entry = dictionary[firstWord];
	  	  
	  if (!entry) {
	   dictionary[firstWord] = {};
	    entry = dictionary[firstWord];
		//console.log(dictionary)
	  }
	  insertWords(entry, restOfWords);
	  //insertWords(topLevelDictionary, restOfWords);
  }


function searchStringInArray (str, strArray) {
    for (var j=0; j<strArray.length; j++) {
        if (strArray[j].match(str)) return j;
    }
    return -1;
}

function formatMenuIntoSentences(input, searchTerm){
	//console.log(input)
	var sentences = input.split(/\.\s*/g).map(function(sentence){return sentence.split(/\s+/g);});
	//console.log(sentences)
	for (var i =0; i < sentences.length; i++) {
	    if(searchStringInArray(searchTerm, sentences[i])>0){
	  	  	insertWords(topLevelDictionary, sentences[i], searchTerm);
		}
	}	
}

function convertTree(dictionary){
	return Object.keys(dictionary).map(function(key){
		var output = {
			name: key,
			children: convertTree(dictionary[key])
		};
		var count = 0;
		for (var i=0; i<output.children.length; i++){
			count += output.children[i].count + 1;
		}
		output.count = count;
		return output;
	});
}

	var margin = {top: 20, right: 120, bottom: 20, left: 120},
	    width = 960 - margin.right - margin.left,
	    height = 800 - margin.top - margin.bottom;
    
	var i = 0,
	    duration = 750,
	    root;

	var tree = d3.layout.tree()
	    .size([height, width]);

	var diagonal = d3.svg.diagonal()
	    .projection(function(d) { return [d.y, d.x]; });

	var svg = d3.select("body").append("svg")
	    .attr("width", width + margin.right + margin.left)
	    .attr("height", height + margin.top + margin.bottom)
	  .append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		
		function drawChart(flare) {
		  root = flare;
		  console.log(flare)
		  root.x0 = height / 2;
		  root.y0 = 0;
	
		  function collapse(d) {
		    if (d.children) {
		      d._children = d.children;
		      d._children.forEach(collapse);
		      d.children = null;
		    }
		  }

		  root.children.forEach(collapse);
  
		  update(root);
		};

		d3.select(self.frameElement).style("height", "800px");

		function update(source) {

		  // Compute the new tree layout.
		  var nodes = tree.nodes(root).reverse(),
		      links = tree.links(nodes);

		  // Normalize for fixed-depth.
		  nodes.forEach(function(d) { d.y = d.depth * 180; });

		  // Update the nodes…
		  var node = svg.selectAll("g.node")
		      .data(nodes, function(d) { return d.id || (d.id = ++i); });

		  // Enter any new nodes at the parent's previous position.
		  var nodeEnter = node.enter().append("g")
		      .attr("class", "node")
		      .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
		      .on("click", click);

		  nodeEnter.append("circle")
		      .attr("r", 1e-6)
		      .style("fill", function(d) { return d._children ? "#666" : "#fff"; });

		  nodeEnter.append("text")
		      .attr("x", function(d) { return d.children || d._children ? -10 : 10; })
		      .attr("dy", ".35em")
		      .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
		      .text(function(d) { return d.name; })
		      .style("fill-opacity", 1e-6);

		  // Transition nodes to their new position.
		  var nodeUpdate = node.transition()
		      .duration(duration)
		      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

		  nodeUpdate.select("circle")
		      .attr("r", 2)
		      .style("fill", function(d) { return d._children ? "#666" : "#fff"; });

		  nodeUpdate.select("text")
		      .style("fill-opacity", 1);

		  // Transition exiting nodes to the parent's new position.
		  var nodeExit = node.exit().transition()
		      .duration(duration)
		      .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
		      .remove();

		  nodeExit.select("circle")
		      .attr("r", 1e-6);

		  nodeExit.select("text")
		      .style("fill-opacity", 1e-6);

		  // Update the links…
		  var link = svg.selectAll("path.link")
		      .data(links, function(d) { return d.target.id; });

		  // Enter any new links at the parent's previous position.
		  link.enter().insert("path", "g")
		      .attr("class", "link")
		      .attr("d", function(d) {
		        var o = {x: source.x0, y: source.y0};
		        return diagonal({source: o, target: o});
		      });

		  // Transition links to their new position.
		  link.transition()
		      .duration(duration)
		      .attr("d", diagonal);

		  // Transition exiting nodes to the parent's new position.
		  link.exit().transition()
		      .duration(duration)
		      .attr("d", function(d) {
		        var o = {x: source.x, y: source.y};
		        return diagonal({source: o, target: o});
		      })
		      .remove();

		  // Stash the old positions for transition.
		  nodes.forEach(function(d) {
		    d.x0 = d.x;
		    d.y0 = d.y;
		  });
		}

		// Toggle children on click.
		function click(d) {
		  if (d.children) {
		    d._children = d.children;
		    d.children = null;
		  } else {
		    d.children = d._children;
		    d._children = null;
		  }
		  update(d);
		}
//console.log(JSON.stringify(topLevelDictionary, null, 2));
