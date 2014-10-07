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
	formatMenuIntoSentences(global.data.toLowerCase(), global.searchTerm)
	//console.log(JSON.stringify(topLevelDictionary, null, 2));	
	d3.select("#output").html("<span style=\"color:red\">Showing results for: "+global.searchTerm+"</span></br></br>"+JSON.stringify(topLevelDictionary, null, 2))
	frm1.searchTerm.value = ""
	topLevelDictionary = {}
}



function searchFor() {
    //document.getElementById("frm1").submit();
	enteredTerm = frm1.searchTerm.value
	d3.select("#output").html("")
	console.log("searched for", enteredTerm )
	if(frm1.searchTerm.value != ""){
		
		formatMenuIntoSentences(global.data.toLowerCase(), frm1.searchTerm.value)
		
		d3.select("#output").html("<span style=\"color:red\">You searched for: "+enteredTerm+"</span></br></br>"+JSON.stringify(topLevelDictionary, null, 2))
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
	   dictionary[firstWord] = {"name":firstWord, "children":{}};
	  // dictionary[firstWord]={}
	    entry = dictionary[firstWord]["children"];
		//console.log(dictionary)
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
	  	  	insertWords(topLevelDictionary, sentences[i], searchTerm);
		}
	}	
}

//console.log(JSON.stringify(topLevelDictionary, null, 2));
