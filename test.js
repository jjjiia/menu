var global = {
	data:null,
	searchTerm:"fresh"
}
$(function() {
	// Window has loaded
	queue()
		.defer(d3.text, csv)
		.await(dataDidLoad);
})

function dataDidLoad(error, data) {
	global.data = data
	formatMenuIntoSentences(global.data.toLowerCase(), global.searchTerm)
	console.log(JSON.stringify(topLevelDictionary, null, 2));
	
	
	d3.select("#containers").html(global.searchTerm+JSON.stringify(topLevelDictionary, null, 2))
}

var topLevelDictionary = {};

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
	  }
	  
	  insertWords(entry, restOfWords);
	  insertWords(topLevelDictionary, restOfWords);
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
	  	  	insertWords(topLevelDictionary, sentences[i], global.searchTerm);
		}
	}	
}

//console.log(JSON.stringify(topLevelDictionary, null, 2));
