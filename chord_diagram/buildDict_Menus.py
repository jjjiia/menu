##make dictionaries for all columns
import csv
import json
import collections
import operator
import re
import string
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

ignoreWords = ["sgl","and","over","assorted","topped","choice","add","$","or","served","all","another","any","anybody","anyone","anything","both","each","either","everybody","everyone","everything","free","few","H","he","her","hers","herself","him","himself","his","I","I","it","its","itself","M","many","me mine","more","most","much","my","myself","no","neither","no one","nobody","none","nothing","on","one","other","others","our","ours","ourselves","same","several","she","some","somebody","someone","something","the","that","their","theirs","them","themselves","these","they","this","those","us","with","we","what","whatever","which","whichever","who","whoever","whom","whomever","whose","Y","you","your","yours","yourself","yourselves"]

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
	with open('cambridge_menus_address.csv', 'rb') as csvfile:
		spamreader = csv.reader(csvfile)
		for row in spamreader:
			rowArray = row[0].split(" ")
			#print rowArray
			testMatrix(rowArray)
	return sortDictionary(dictionary)
	
#print buildWordLinks()

def clearup(s, chars):
    return re.sub('[%s]' % chars, '', s).lower()
 
#s = 'This is %a t1e22st !st4ring6 w.it6h 87embed766ded punct,:ua-tion and nu=mbe]rS6.'
 
#print clearup(s, string.punctuation+string.digits)
 
def appendMenuItems(dictionary):
	#print dictionary
	with open('cambridge_menus_address.csv', 'rb') as csvfile:
		spamreader = csv.reader(csvfile)
		outputFile = open("cambridge_address_test5.csv", "w")
		outputWriter = csv.writer(outputFile)
		outputWriter.writerow(["term1","term2","count","foods","restaurant","coordinates","zipcode","address","type"])
		
		for key, value in dictionary:
			#print key,value
			csvfile.seek(0)
			menuItemsArray = []
			restaurantsArray = []
			restaurantTypeArray = []
			addressArray = []
			zipcodeArray = []
			coordinatesArray = []
			keyArray = key.split(",")
			key1 = keyArray[0]
			key2 = keyArray[1]
			wordPairArray = [keyArray[0],keyArray[1],value]
			
			#print key1, key2
			for row in spamreader:
				rowArray = row[0].split(" ")
				#print rowArray
				restaurant = row[1]
				coordinates = row[2]
				zipcode = row[3]
				address = row[4]
				restaurantType = row[5]
				formatedRestaurant = restaurant.split("-")
				formatedRestaurant[-1] = clearup(formatedRestaurant[-1], string.punctuation+string.digits)
				formatedRestaurant = ' '.join(formatedRestaurant)
				#formatedRestaurant = clearup(formatedRestaurant, string.punctuation+string.digits)
				#print restaurant, formatedRestaurant
				if key1 in rowArray and key2 in rowArray:
					rowNoRes = ' '.join(rowArray)
					menuItemsArray.append(rowNoRes)
					if formatedRestaurant not in restaurantsArray:
						#print "no", formatedRestaurant, restaurantsArray
						restaurantsArray.append(formatedRestaurant)
						coordinatesArray.append(coordinates)
						addressArray.append(address)
					if zipcode not in zipcodeArray:
						zipcodeArray.append(zipcode)
					if restaurantType not in restaurantTypeArray:
						restaurantTypeArray.append(restaurantType)

			#print restaurantsArray
			wordPairArray.append(menuItemsArray)
			wordPairArray.append(restaurantsArray)
			wordPairArray.append(coordinatesArray)
			wordPairArray.append(zipcodeArray)
			wordPairArray.append(addressArray)
			wordPairArray.append(restaurantTypeArray)
			outputWriter.writerow(wordPairArray)
			#print wordPairArray
appendMenuItems(buildWordLinks())
	
