//TODO: fisheye for rollovers
//TODO: collapse all into 1 sentence if no branches
//TODO: make search work
//TODO: add pre selected search terms
//TODO: add retaurant list?
//TODO: add reverse tree

var global = {
	data:null,
	searchTerm:"tamarind"
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
	console.log(convertTree(dictionary1))
	drawChart(convertTree(dictionary1)[0],svg)
	//filterTree(convertTree(dictionary1)[0])
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
	//console.log("searched for", enteredTerm)
	if(frm1.searchTerm.value != ""){
		formatMenuIntoSentences(global.data1.toLowerCase(), enteredTerm, dictionary1)
		//console.log(dictionary1)
		drawChart(convertTree(dictionary1)[0],svg)
		//displayResults()
	}
	//clear the input from form
	frm1.searchTerm.value = ""
	dictionary1 = {}
}

document.onkeydown=function(){
    if(window.event.keyCode=='13'){
        searchFor();
    }
}

var restOfWords=null;

function formatMenuIntoSentences(input, searchTerm, dictionary){
	//console.log(input)
	var sentences = input.split(/\.\s*/g).map(function(sentence){return sentence.split(/\s+/g);});
	//console.log(sentences)
	for (var i =0; i < sentences.length; i++) {
	    if(searchStringInArray(searchTerm, sentences[i]) > 0){
	  	  	insertWords(dictionary, sentences[i], searchTerm);
		}
	}	
}

function insertWords(dictionary, words, searchTerm) {
  if (words.length === 0) {
    return;
  }
  
  var searchTermIndex = searchStringInArray(searchTerm, words)	  
  var firstWord = words[searchTermIndex].toLowerCase();
  restOfWords = words.slice(searchTermIndex+1);
  var entry = dictionary[firstWord];
  if (!entry) {
   	dictionary[firstWord] = {};
    entry = dictionary[firstWord];
  }
  while(restOfWords.length >5){
	  insertWords(entry, restOfWords);
  	
  }
}

//TODO: make word match, not string match
//function searchStringInArray (str, strArray) {
//    var result = strArray.indexOf(str)
//	console.log(result)
//	return result
//}

function searchStringInArray (str, strArray) {
    for (var j=0; j<strArray.length; j++) {
        if (strArray[j].match(str)) return j;
    }
    return -1;
}
function convertTree(dictionary){
	return Object.keys(dictionary).map(function(key){
		var output = {
			name: key,
			children: convertTree(dictionary[key])
		};
		var count = 0;
		for (var i=0; i<output.children.length; i++){
			console.log(output.children[i].count)
			count += output.children[i].count + 1;
		}
		output.count = count;
		return output;
	});
}


/////DRAWING BELOW

var margin = {top: 20, right: 120, bottom: 20, left: 0},
    width = 6000 - margin.right - margin.left,
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
	

function drawChart(flare, svg) {
  root = flare;
  root.x0 = height / 2;
  root.y0 = 0;
  console.log(flare)
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
	//console.log(source.children.length)

  var topLevelSize = source.count
  var sizeScale = d3.scale.sqrt().domain([10, topLevelSize]).range([100,0]) 
  var textSizeScale = d3.scale.sqrt().domain([0, topLevelSize]).range([2,60]) 
  var opacityScale = d3.scale.linear().domain([0, topLevelSize]).range([0,1]) 
  // Compute the new tree layout.
  var nodes = tree.nodes(root).reverse(),
      links = tree.links(nodes);
 
  // Normalize for fixed-depth.
  nodes.forEach(function(d,i){d.y = d.depth*150;});
  //nodes.forEach(function(d,i) {d.y = d.depth * sizeScale(d.count) });

  // Update the nodes…
  var node = svg.selectAll("g.node")
      .data(nodes, function(d){return d.id || (d.id = ++i);});

  // Enter any new nodes at the parent's previous position.
  var nodeEnter = node.enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
      .on("click", click);

  nodeEnter.append("circle")
      .attr("r", function(d){return 3})
      .style("fill", function(d) { return d._children ? "#666" : "#fff"; });

  nodeEnter.append("text")
      .attr("x", function(d) { return 2; return d.children || d._children ? 0 : 10; })
      .attr("dy", function(d){
		 // return 12
		  return textSizeScale(d.count)
	  })
      .attr("text-anchor", function(d) { return "start";return d.children || d._children ? "end" : "start"; })
      .text(function(d) { return d.name; })
      .style("fill-opacity",function(d){
		  return opacityScale(d.count)
	  })
	  .style("font-size", function(d){
		 // return 12
		  return textSizeScale(d.count)
	  })
  // Transition nodes to their new position.
  var nodeUpdate = node.transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

  nodeUpdate.select("circle")
      .attr("r", 0)
      .style("fill", function(d) { return d._children ? "#666" : "#fff"; });

  nodeUpdate.select("text")
      .style("fill-opacity", 1)
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
