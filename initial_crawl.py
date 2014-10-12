#!/usr/bin/env python

import urllib2
import sys
import json
from bs4 import BeautifulSoup, NavigableString
import re
import csv
import datetime
import os
duplicates = []
latestDictionary = {}
import time

basecity = "boston"
baseURL1 = ".menupages.com/restaurants/"
baseURL2 = "/all-neighborhoods/all-cuisines/"
neighborhoods = ["cambridge"]
#neighborhoods = ["downtown-north-end","back-bay-beacon-hill-south-end","fenway-symphony-jamaica-plain","brookline-brighton-allston"]
def download_craigslist(page_count = 1, limit = 5):
    data = []
    duplicateCount = 0
    uniqueCount = 0
    page_count = 10
    for i in range(page_count):
		#for neightborhoods
        #link = 'http://'+basecity+baseURL1+baseURL2 + str(i+1)
		
		#for larger areas
        link = 'http://'+basecity+baseURL1 +city+baseURL2 + str(i+1)
        #print link
        soup = BeautifulSoup(urllib2.urlopen(link).read())
        #x =  soup.body.article.section.div
        x =  soup.find("div",{"id":"searchresults"})
        #print x
        title = []
        time = []
        art = []
        
        for tag in x.find_all('a',{"class":"link"}):
            linkOnly = str(tag).split("\"")[3]
            #print tag.split("\"")[1]
            k=0
            art.append(linkOnly)
            #link = tag.find_all('a')
            #print link
			#	art.append(ah['href'])

        #print art
        
        for l in art:
            data = []
            url = "http://"+basecity+".menupages.com"+l+"menu"
            #print url
            sidesoup = BeautifulSoup(urllib2.urlopen(url).read())
            menu = sidesoup.find("div",{"id":"restaurant-menu"})
            table_body = menu.find_all('tbody')
            rows = menu.find_all('tr')
            for row in rows:
				#print row
				test = re.sub("<.*?>", " ", str(row).lower())
				test = re.sub("-", "", test)
				
				test = re.sub(r"[\xc2\xa0\xe2\x80\x99]","",test)
				test = re.sub('\d\d\W\d\d','',test)
				test = re.sub('\d\W\d\d','',test)
				test = re.sub('\W\d\d','',test)

				test =  test.strip()				
				#prices = re.search('\d\W\d\d', test)
				#print prices
				##prices = re.sub(".", " ", prices)
				test = re.sub("&amp;","", test)
				test = re.sub(","," ", test)
				test = re.sub(":","", test)
				test = re.sub("-","", test)
				test = re.sub("\*","", test)
				test = re.sub("\.","", test)
				
				test =" ".join(test.split())
				
				#print test
				restaurantName = str(l).split("/")[2]
				
				
				
				#data.append(test+" "+restaurantName)
            #cleanMenu = [str(l),data]
				#print test+" "+restaurantName
				spamwriter.writerow([test+" "+restaurantName])
           	 	#print cleanMenu
            print restaurantName
#cities = ["brookline-brighton-allston","downtown-north-end", "fenway-symphony-jamaica-plain","back-bay-beacon-hill-south-end"]
#neighborhoods = ["cambridgeport","harvard-square","east-cambridge","central-sq-inman-sq","porter-sq-fresh-pond"]

if __name__ == "__main__":
    if len(sys.argv) >= 2 and sys.argv[1] == "crawl":
       if len(sys.argv) <= 2:
            page_count = 1
       else:
            page_count = sys.argv[2]

       if len(sys.argv) <= 3:
            limit = 5
       else:
            limit = sys.argv[3]

       print "Crawling Craigslist"
       print "Page Count: " + str(page_count)
       print "Limit: " + str(limit)
        #print json.dumps(download_craigslist(int(page_count), int(limit)))
       # json.dump(json.dumps(download_craigslist(int(page_count), int(limit))), outfile)
       
	   
       for i in range(len(neighborhoods)):
		   time.sleep(10)
		   city = neighborhoods[i]
		   print city
		   outputfile = open(city+"_menus.csv","wb")
		   spamwriter = csv.writer(outputfile)
		   #spamwriter.writerow(["url","menu"])
		   while True:
			   try:
				   download_craigslist(int(page_count), int(limit))
				   sys.exit(0)
			   except Exception, e:
				   i+=1
				   print e 
				   break
    elif len(sys.argv) >= 2 and sys.argv[1] == "serve":
        print "Server not implemented yet."
    else:
        print """
Usage crawler: 
    python craigslist.py crawl <page_count> <limit>

Usage server:
    python craigslist.py serve
        """
        