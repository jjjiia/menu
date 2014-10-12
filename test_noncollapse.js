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
	rightDictionary = {}
	leftDictionary = {}
	formatMenuIntoSentences(global.data1.toLowerCase(), global.searchTerm)
	console.log(convertTree(rightDictionary))
	console.log(convertTree(leftDictionary))
	
	drawChart(convertTree(rightDictionary)[0])
	drawLeftChart(convertTree(leftDictionary)[0])
	
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


function searchFor() {
    //document.getElementById("frm1").submit();
	var enteredTerm = frm1.searchTerm.value
	d3.select("#output").html("")
	//console.log("searched for", enteredTerm)
	if(frm1.searchTerm.value != ""){
		formatMenuIntoSentences(global.data1.toLowerCase(), enteredTerm)
		//console.log(dictionary1)
		d3.select("#tree1 svg").remove()
		drawChart(convertTree(rightDictionary)[0],svg)
		drawLeftChart(convertTree(leftDictionary)[0], svg2)
		
		//displayResults()
	}
	//clear the input from form
	frm1.searchTerm.value = ""
	rightDictionary = {}
	leftDictionary = {}
	
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
}


/////DRAWING BELOW
var width = 500
var height =600


	//attr("transform", "translate(" + margin.left + "," + margin.top + ")");
function drawChart(root) {
	console.log(root.name.length)
	var margin = root.name.length*23
	var svg = d3.select("#tree1").append("svg")
		.attr("width", width+margin+350)
		.attr("height", height)
		.append("g")
		.attr("transform", "translate(" + margin + "," + 0 + ")");
	console.log(root)
	var i = 0,
	    duration = 250,
	    root;
	var tree = d3.layout.tree()
	    .size([height, width]);
		var cluster = d3.layout.cluster()
		    .size([height, width+margin+350]);
	var diagonal = d3.svg.diagonal()
	    .projection(function(d) { return [d.y, d.x]; });
	
	var nodes = tree.nodes(root);
    var links = tree.links(nodes);
	var maxSibling = root.sibling
	var maxCount = root.count
    var textSizeScale = d3.scale.sqrt().domain([0,maxSibling]).range([1,50])
    var opacityScale = d3.scale.sqrt().domain([40, maxCount]).range([0.6,1]) 
	var link = svg.selectAll(".link")
		.data(links)
  	 	.enter().append("path")
		.attr("class", "link")
		.attr("d", diagonal);
  	var node = svg.selectAll(".node")
      	.data(nodes)
	    .enter().append("g")
     	.attr("class", "node")
     	.attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
  node.append("circle")
      	.attr("r", 0);
  node.append("text")
      //.attr("dx", function(d) { return d.children ? -8 : 8; })
	  .attr("dx", function(d) {//console.log(d.name, d.name.length, d.count); 
		  return 12*d.name.length*d.depth;})
      .attr("dy", function(d){
		  return textSizeScale(d.depth)/2
		  return textSizeScale(d.depth)
	  })
	  .style("fill-opacity", function(d){
		  return opacityScale(d.count)
	  })
      .style("text-anchor", function(d) { return d.children ? "end" : "start"; })
      .text(function(d) { return d.name; })
	  .style("font-size", function(d){
		 if(d.count <1){
			 return 0
		 }
		  return textSizeScale(d.sibling)
	  })
	  .on("mouseover", function(d){
		  //console.log(d.name);
		  originalSize = d3.select(this).style("font-size")
		  //console.log(originalSize)
		  d3.select(this).transition().style("font-size", 30)
	  })
	  .on("mouseout", function(d){
		 // console.log(d.name); 
		  d3.select(this).transition().style("font-size", originalSize)
	  })
}

function drawLeftChart(root, side) {
	var svg2 = d3.select("#tree2").append("svg")
		.attr("width", width)
		.attr("height", height)
		.append("g")
		.attr("transform", "translate(" + width + "," + 0 + ")");
	var i = 0,
	    duration = 250,
	    root;
	var tree = d3.layout.tree()
	    .size([height, width]);
		var cluster = d3.layout.cluster()
		    .size([height, width]);
			if(side == "right"){
				var diagonal = d3.svg.diagonal()
				    .projection(function(d) { return [d.y, d.x]; });
			}else{
				var diagonal = d3.svg.diagonal()
				    .projection(function(d) { return [-d.y, d.x]; });
			}
	var nodes = tree.nodes(root);
    var links = tree.links(nodes);
	var maxSibling = root.sibling
	var maxCount = root.count
    var textSizeScale = d3.scale.sqrt().domain([0,maxSibling]).range([1,50])
    var opacityScale = d3.scale.sqrt().domain([40, maxCount]).range([0.6,1]) 
	var link = svg2.selectAll(".link")
		.data(links)
  	 	.enter().append("path")
		.attr("class", "link")
		.attr("d", diagonal);
  	var node = svg2.selectAll(".node")
      	.data(nodes)
	    .enter().append("g")
     	.attr("class", "node")
     	.attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
  node.append("circle")
      	.attr("r", 0);
  node.append("text")
      //.attr("dx", function(d) { return d.children ? -8 : 8; })
	  .attr("dx", function(d) {//console.log(d.name, d.name.length, d.count); 
		  return -12*d.name.length*d.depth;})
      .attr("dy", function(d){
		  return textSizeScale(d.depth)/2
		  return textSizeScale(d.depth)
	  })
	  .style("fill-opacity", function(d){
		  if(d.name == root.name){
			  return 0
		  }
		  return opacityScale(d.count)
	  })
      .style("text-anchor", function(d) { return d.children ? "end" : "start"; })
      .text(function(d) { return d.name; })
	  .style("font-size", function(d){
		 if(d.count <1){
			 return 0
		 }
		  return textSizeScale(d.sibling)
	  })
	  .on("mouseover", function(d){
		  //console.log(d.name);
		  originalSize = d3.select(this).style("font-size")
		  //console.log(originalSize)
		  d3.select(this).transition().style("font-size", 30)
	  })
	  .on("mouseout", function(d){
		 // console.log(d.name); 
		  d3.select(this).transition().style("font-size", originalSize)
	  })
}	

//console.log(JSON.stringify(topLevelDictionary, null, 2));

//console.log(JSON.stringify(topLevelDictionary, null, 2));
