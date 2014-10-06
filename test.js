var global = {
	data:null,
	searchTerm:"noodles"
}
$(function() {
	// Window has loaded
	queue()
		.defer(d3.text, csv)
		.await(dataDidLoad);
})

function dataDidLoad(error, data) {
	global.data = data
	formatMenuIntoSentences(global.data.toLowerCase())
	console.log(JSON.stringify(topLevelDictionary, null, 2));
	d3.select("#containers").html(JSON.stringify(topLevelDictionary, null, 2))
}

var topLevelDictionary = {};

function insertWords(dictionary, words, searchTerm) {
  if (words.length === 0) {
    return;
  }
  //console.log(words)
  if(searchStringInArray(searchTerm, words)>0){
	  var firstWord = words[0].toLowerCase();
	  var restOfWords = words.slice(1);
	  var entry = dictionary[firstWord];
	  	  
	  if (!entry) {
	    dictionary[firstWord] = {};
	    entry = dictionary[firstWord];
	  }
	  insertWords(entry, restOfWords);
	  insertWords(topLevelDictionary, restOfWords);
  }
}

function searchStringInArray (str, strArray) {
    for (var j=0; j<strArray.length; j++) {
        if (strArray[j].match(str)) return j;
    }
    return -1;
}

function formatMenuIntoSentences(input){
	//console.log(input)
	var sentences = input.split(/\.\s*/g).map(function(sentence){return sentence.split(/\s+/g);});
	//console.log(sentences)
	for (var i =0; i < sentences.length; i++) {
	  insertWords(topLevelDictionary, sentences[i], global.searchTerm);
	}	
}

//console.log(JSON.stringify(topLevelDictionary, null, 2));
