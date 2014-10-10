//TODO: fisheye for rollovers
//TODO: collapse all into 1 sentence if no branches
//TODO: make search work
//TODO: add pre selected search terms
//TODO: add retaurant list?
//TODO: add reverse tree

var global = {
	data:null,
	searchTerm:"fresh"
}
var topLevelDictionary = {};

$(function() {
	// Window has loaded
	queue()
		.defer(d3.text, csv)
		//.defer(d3.text, csv2)
		
		.await(dataDidLoad);
})
function dataDidLoad(error, data1, data2) {
	global.data1 = data1
	//global.data2 = data2
	dictionary1 = {}
	
	formatMenuIntoSentences(global.data1.toLowerCase(), global.searchTerm, dictionary1)
	drawChart(convertTree( dictionary1)[0],svg)
	
//	formatMenuIntoSentences(global.data2.toLowerCase(), global.searchTerm, dictionary2)
//	drawChart(convertTree(dictionary2)[0],treesvg2)

	frm1.searchTerm.value = ""
	dictionary1 = {}
}

//TODO: expand all

//function displayResults(){
//	var displaystring = JSON.stringify(convertTree(topLevelDictionary)[0], null, 2)
//	d3.select("#output").html("<span style=\"color:red\">Showing results for: "+global.searchTerm+"</span></br></br><pre>"+displaystring+"</pre>")
//	
//}

function searchFor() {
    //document.getElementById("frm1").submit();
	var enteredTerm = frm1.searchTerm.value
	d3.select("#output").html("")
	console.log("searched for", enteredTerm)
	if(frm1.searchTerm.value != ""){
		formatMenuIntoSentences(global.data1.toLowerCase(), enteredTerm, dictionary1)
		console.log(dictionary1)
		drawChart(convertTree(dictionary1)[0],svg)
		//displayResults()
	}
	//clear the input from form
	frm1.searchTerm.value = ""
	dictionary1 = {}
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

function formatMenuIntoSentences(input, searchTerm, dictionary){
	//console.log(input)
	var sentences = input.split(/\.\s*/g).map(function(sentence){return sentence.split(/\s+/g);});
	//console.log(sentences)
	for (var i =0; i < sentences.length; i++) {
	    if(searchStringInArray(searchTerm, sentences[i])>0){
	  	  	insertWords(dictionary, sentences[i], searchTerm);
		}
	}	
}

var margin = {top: 20, right: 120, bottom: 20, left: 120},
    width = 1200 - margin.right - margin.left,
    height = 600 - margin.top - margin.bottom;

var i = 0,
    duration = 250,
    root;

var tree = d3.layout.tree()
    .size([height, width]);

var diagonal = d3.svg.diagonal()
    .projection(function(d) { return [d.y, d.x]; });

var svg = d3.select("#tree1").append("svg")
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	

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

function drawChart(flare, svg) {
  root = flare;
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
	//TODO:find max and min for each tree to use in scale
  var sizeScale = d3.scale.sqrt().domain([10, 1200]).range([700,0]) 
  var textSizeScale = d3.scale.sqrt().domain([10, 1200]).range([4,12]) 
  	
  // Compute the new tree layout.
  var nodes = tree.nodes(root).reverse(),
      links = tree.links(nodes);
  var fisheye = d3.fisheye.circular()
      .radius(200)
      .distortion(2);

 svg.on("mousemove", function() {
    fisheye.focus(d3.mouse(this));
	node.each(function(d) { d.fisheye = fisheye(d); })
	      .attr("cx", function(d) { return d.fisheye.x; })
	      .attr("cy", function(d) { return d.fisheye.y; })
	      .attr("r", function(d) { return d.fisheye.z * 4.5; });

	  link.attr("x1", function(d) { return d.source.fisheye.x; })
	      .attr("y1", function(d) { return d.source.fisheye.y; })
	      .attr("x2", function(d) { return d.target.fisheye.x; })
	      .attr("y2", function(d) { return d.target.fisheye.y; });
  });
  // Normalize for fixed-depth.
  //nodes.forEach(function(d,i) { d.y = d.depth * i*5; });
  nodes.forEach(function(d,i) {console.log(d.depth); d.y = d.depth * sizeScale(d.count) });

  // Update the nodes…
  var node = svg.selectAll("g.node")
      .data(nodes, function(d) {  return d.id || (d.id = ++i); });

  // Enter any new nodes at the parent's previous position.
  var nodeEnter = node.enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
      .on("click", click);

  nodeEnter.append("circle")
      .attr("r", function(d){return 3})
      .style("fill", function(d) { return d._children ? "#666" : "#fff"; });

  nodeEnter.append("text")
      .attr("x", function(d) { return d.children || d._children ? 0 : 10; })
      .attr("dy", ".35em")
      .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
      .text(function(d) { return d.name; })
      .style("fill-opacity",.1)
	  .style("font-size", function(d){return textSizeScale(d.count)})
  // Transition nodes to their new position.
  var nodeUpdate = node.transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

  nodeUpdate.select("circle")
      .attr("r", 0)
      .style("fill", function(d) { return d._children ? "#666" : "#fff"; });

  nodeUpdate.select("text")
      .style("fill-opacity", 1)
	  //.sylte("font", 20)
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
