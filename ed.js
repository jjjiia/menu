var input = "Gyozasix pot stickers.Tuna Pokifresh tuna with cucumber.  spicy tuna seaweed and tuna flakes.Cherry Blossomtuna eel and fresh salmon topped with ikura";
var topLevelDictionary = {};

function insertWords(dictionary, words) {
  if (words.length === 0) {
    return;
  }

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

var sentences = input.split(/\.\s*/g).map(function(sentence){return sentence.split(/\s+/g);});
for (var i =0; i < sentences.length; i++) {
  insertWords(topLevelDictionary, sentences[i]);
}

console.log(JSON.stringify(topLevelDictionary, null, 2));
