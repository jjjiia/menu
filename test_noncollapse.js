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
			if(sentences[i].length > 3 ){
		  	  	insertWords(dictionary, sentences[i], searchTerm);
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

var margin = {top: 20, right: 0, bottom: 20, left: 220},
    width =1200 - margin.right - margin.left,
    height = 600 - margin.top - margin.bottom;

var i = 0,
    duration = 250,
    root;

var tree = d3.layout.tree()
    .size([height, width]);
	var cluster = d3.layout.cluster()
	    .size([height, width]);
var diagonal = d3.svg.diagonal()
    .projection(function(d) { return [d.y, d.x]; });

var svg = d3.select("#tree1").append("svg")
   .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
function drawChart(root, svg) {
	d3.select("#tree1 svg").remove()
	var svg = d3.select("#tree1").append("svg")
	   .attr("width", width + margin.right + margin.left)
	    .attr("height", height + margin.top + margin.bottom)
	  .append("g")
	  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	console.log("draw")
	var nodes = tree.nodes(root);
    var links = tree.links(nodes);
	//  console.log(nodes)
	var max = root.sibling
    var textSizeScale = d3.scale.sqrt().domain([0,max]).range([1,50])
	console.log(root)
	 console.log(textSizeScale(max), max, root.sibling) 
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
		  return 10*d.name.length;})
      .attr("dy", function(d){
		  return textSizeScale(d.depth)/2
		  return textSizeScale(d.depth)
	  })
      .style("text-anchor", function(d) { return d.children ? "end" : "start"; })
      .text(function(d) { return d.name; })
	  .style("font-size", function(d){
		 // return 12
		 if(d.count <2){
			 return 0
		 }
		  return textSizeScale(d.sibling)
	  })
	  .on("mouseover", function(d){
		  //console.log(d.name);
		  originalSize = d3.select(this).style("font-size")
		  //console.log(originalSize)
		  d3.select(this).style("font-size", 30)
	  })
	  .on("mouseout", function(d){
		 // console.log(d.name); 
		  d3.select(this).style("font-size", originalSize)
	  })
}
//console.log(JSON.stringify(topLevelDictionary, null, 2));
