##make dictionaries for all columns
import csv
import json
import collections
import operator

endsInS = {}



def sortDictionary(dictionary):
	sortedDictionary = sorted(dictionary.items(), key=operator.itemgetter(1), reverse=True)
	return sortedDictionary[0:1000]

def wordFrequency():
	basicDictionary = {}
	with open('cambridge_menus_nouns.csv', 'rb') as csvfile:
		spamreader = csv.reader(csvfile)
		for row in spamreader:
			rowArray = str(row).split(" ")
			for i in rowArray:
				keyword = i
				if len(keyword)>2 and keyword not in ignoreWords:
				#row = row.strip()
				#row = row.decode('utf8')
					basicDictionary[keyword] = basicDictionary.get(keyword,0)+1
	return sortDictionary(basicDictionary)
#print wordFrequency()

cooccurenceDict = {}

teststring = "froj deliciously sweet vegan soy milk orange juice vanilla"

dictionary = {}
keys = []

ignoreWords = ["and","over","assorted","topped","choice","add","$","or","served","all","another","any","anybody","anyone","anything","both","each","either","everybody","everyone","everything","free","few","H","he","her","hers","herself","him","himself","his","I","I","it","its","itself","M","many","me mine","more","most","much","my","myself","no","neither","no one","nobody","none","nothing","on","one","other","others","our","ours","ourselves","same","several","she","some","somebody","someone","something","the","that","their","theirs","them","themselves","these","they","this","those","us","with","we","what","whatever","which","whichever","who","whoever","whom","whomever","whose","Y","you","your","yours","yourself","yourselves"]

def buildDictionary(dictionary, key):
	dictionary[key] = dictionary.get(key,0)+1
	
def doNothing():
	doNothing = ""
	
def testMatrix(testarray):
	#testarray = teststring.split(" ")
	for i in testarray:
		for j in testarray:
			jLength = len(j)
			iLength = len(i)
			if str(i) == str(j):
				doNothing()
			elif jLength > 2 and iLength>2:
				if i in ignoreWords or j in ignoreWords:
					doNothing()
				else:
					keyArray = sorted([i,j])
					key = keyArray[0]+","+keyArray[1]
					keys.append(key)
					buildDictionary(dictionary, key)
	return dictionary
	
def buildWordLinks():
	with open('philadelphia_bucks-county_menus_noRes.csv', 'rb') as csvfile:
		spamreader = csv.reader(csvfile)
		for row in spamreader:
			rowArray = str(row).split(" ")
			testMatrix(rowArray)
	return sortDictionary(dictionary)
	
print buildWordLinks()

	
