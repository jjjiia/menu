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
	rightDictionary = {}
	leftDictionary = {}
	UpdateAll(global.searchTerm)
	//drawLeftChart(convertTree(leftDictionary)[0])
	
	//filterTree(convertTree(dictionary1)[0])
//	formatMenuIntoSentences(global.data2.toLowerCase(), global.searchTerm, dictionary2)
//	drawChart(convertTree(dictionary2)[0],treesvg2)

	frm1.searchTerm.value = ""
}

//TODO: expand all

//function displayResults(){
//	var displaystring = JSON.stringify(convertTree(topLevelDictionary)[0], null, 2)
//	d3.select("#output").html("<span style=\"color:red\">Showing results for: "+global.searchTerm+"</span></br></br><pre>"+displaystring+"</pre>")
//	
//}
function UpdateAll(enteredTerm){
	formatMenuIntoSentences(global.data1.toLowerCase(), enteredTerm)
	d3.select("#tree1 svg").remove()
	//joinOnlyChildren(convertTree(rightDictionary)[0])
    var baseSvg = d3.select("#tree1").append("svg").attr("width", 1200).attr("height", 800)
	var baseGroup = baseSvg.append("g")
	var rightGroup = baseGroup.append("g")
	var leftGroup = baseGroup.append("g")
	
	var rightData = convertTree(rightDictionary)[0]
	var leftData = convertTree(leftDictionary)[0]
	
	rightData = flattenTree(rightData, true)
	leftData = flattenTree(leftData, false)
	
	//drawChart(treeData, baseSvg, svgGroup, side)
	drawChart(rightData, baseSvg, rightGroup, "right")
	//drawChart(leftData, baseSvg, leftGroup, "left")
	
	frm1.searchTerm.value = ""
	rightDictionary = {}
	leftDictionary = {}
}

function flattenTree(tree, append) {
	var list = []
	
	for(var i in tree.children) {
		var child = tree.children[i]
		list.push(flattenTree(child, append))
	}
	if(list.length == 1) {
		if(append) {
			tree.name = tree.name + " " + list[0].name
		} else {
			tree.name = list[0].name + " " + tree.name
		}
		tree.children = list[0].children
	}
	return tree;
}

function searchFor() {
    //document.getElementById("frm1").submit();
	d3.select("#output").html("")
	//console.log("searched for", enteredTerm)
	if(frm1.searchTerm.value != ""){
		UpdateAll(frm1.searchTerm.value)
	}
}

document.onkeydown=function(){
    if(window.event.keyCode=='13'){
        searchFor();
    }
}

var restOfWords=null;

function formatMenuIntoSentences(input, searchTerm){
	//console.log(input)
	var sentences = input.split(/\.\s*/g).map(function(sentence){return sentence.split(/\s+/g);});
	//console.log(sentences)
	for (var i =0; i < sentences.length; i++) {
	    if(searchStringInArray(searchTerm, sentences[i]) > 0){
			if(sentences[i].length > 3 ){
				var wordIndex = searchStringInArray(searchTerm, sentences[i])
				var rightSentence = sentences[i].slice(wordIndex, sentences[i].length)
				var leftSentence = sentences[i].slice(0, wordIndex+1)
				//console.log(leftSentence)
				
				var leftSentence = leftSentence.reverse()
				//console.log(leftSentence)
		  	  	insertWords(rightDictionary, rightSentence, searchTerm);
				if(leftSentence.length<30){
				insertWords(leftDictionary, leftSentence, searchTerm)
			}
			}
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
  insertWords(entry, restOfWords);
  
 // if(restOfWords.length > 2){
 //	  insertWords(entry, restOfWords);
 // }else{
 //	dictionary[restOfWords] = {}  
 // 	entry = dictionary[restOfWords];
 // }
  
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
	var tree = Object.keys(dictionary).map(function(key){
		var output = {
			name: key,
			children: convertTree(dictionary[key])
		};
		var count = 0;
		var sibling = 0;
		for (var i=0; i<output.children.length; i++){
			//console.log(output.children[i].count)
			count += output.children[i].count + 1;
			if(output.children[i].count>0){
				sibling +=1
			}
		}
		output.count = count;
		output.sibling = sibling
		
		return output;
	});

	return tree
}

/////DRAWING BELOW
var width = 1200
var height =600
var tree = d3.layout.tree()
    .size([height, width]);
	
var i = 0,
    duration = 250,
    root;
	
function drawChart(treeData, baseSvg, subGroup, side) {
	root = treeData;
	root.x0 = height / 2;
	root.y0 = 10;


	function collapse(d) {
	    if (d.children) {
	      d._children = d.children;
	      d._children.forEach(collapse);
	      d.children = null;
	    }
	  }
	// root.children.forEach(collapse);
 update(root, baseSvg, subGroup, side);
}	

d3.select(self.frameElement).style("height", "800px");

function update(source, svg, subGroup, side) {
	    //.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		if(side == "right"){
			subGroup.attr("transform", "translate(" + parseInt(width/2) + "," + 0 + ")");
		}else{
			subGroup.attr("transform", "translate(" + width/2 + "," + 0 + ")");
				
			}
			
		
	var diagonal = d3.svg.diagonal()
	    .projection(function(d) { 
			if(side == "right"){
				return [d.y, d.x]; 
			}else{
				return [d.y, d.x]; 
			}
		});
  // Compute the new tree layout.
  var nodes = tree.nodes(root).reverse(),
      links = tree.links(nodes);

  // Normalize for fixed-depth.
  nodes.forEach(function(d) { 
	  if(side == "right"){
	  return d.y = d.depth * 80;	  	
	  }else{
		  return d.y = d.depth * -80;	  	
	  	
	  }
 });
  // Update the nodes…
  var node =  subGroup.selectAll("g.node")
      .data(nodes, function(d) { return d.id || (d.id = ++i); });

  // Enter any new nodes at the parent's previous position.
  var nodeEnter = node.enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
      .on("click", click);

  nodeEnter.append("circle")
      .attr("r", 1e-6)
      .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

  nodeEnter.append("text")
      .attr("x", function(d) { return d.children || d._children ? -10 : 10; })
      .attr("dy", ".35em")
      .attr("text-anchor", function(d) { return "start"; })
	  
      //.attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
      .text(function(d) { return d.name; })
      .style("fill-opacity", 1e-6);

  // Transition nodes to their new position.
  var nodeUpdate = node.transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

  nodeUpdate.select("circle")
      .attr("r", 0)
      .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

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
  var link =  subGroup.selectAll("path.link")
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