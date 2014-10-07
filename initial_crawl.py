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

city = "cambridge"
basecity = "boston"
baseURL1 = ".menupages.com/restaurants/"
baseURL2 = "/all-neighborhoods/all-cuisines/"
page = 1


def download_craigslist(page_count = 1, limit = 5):
    data = []
    duplicateCount = 0
    uniqueCount = 0
    page_count = 7
    for i in range(page_count):
        link = 'http://'+basecity+baseURL1 +city+baseURL2 + str(i+1)
        print link
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
				cols = row.find_all('td')
				test = [ele.text.strip() for ele in cols]
				data.append([ele for ele in cols if ele])
            print data
            if len(sidesoup.findAll(class_="bigattr"))>0:
                compensation = str(sidesoup.findAll(class_="bigattr")[0].text.encode("utf8").split(":")[1])
            else:
                compensation = "NA"
            #description = str(sidesoup.findAll("section",id="postingbody")[0].text.encode("utf8"))
            area = str(l.split("/")[1])
            profession = str(l.split("/")[2])
            if(sidesoup.body):
                #print sidesoup.body
                if (sidesoup.body.article):
                  # print sidesoup.body.article
                    if(sidesoup.body.article.section):
                     #   print sidesoup.body.article.section
                        
                        if(sidesoup.body.article.section.section):
                            time = str(sidesoup.body.article.section.section.p.time.string)
            
                        url = base+l
                        title = str(sidesoup.body.article.section.h2.text[4:-1].encode("utf8"))
                        postdate = time.split(" ")[0]
                        description = str(sidesoup.findAll("section",id="postingbody")[0].text.encode("utf8")).lower()
            
                        keywordCountArray = []
            
                        outputArray = [area, profession, title, time, compensation, url]
            
                        for keyword in keywords:
                            keywordcount = 0
                            for word in description.split(" "):
                                if keyword == word or keyword in title.lower():
                                    keywordcount +=1
                            #keywordCountArray.append(keywordcount)
                            outputArray.append(keywordcount)
                        #alreadydownloaded = downloaded.readlines()
                        #print columnsChecked
                        alreadydownloaded =[]
                        if l in alreadydownloaded:
                            duplicateCount+=1
                            print "duplicate timestamp", duplicateCount
            #                    print "duplicate", [area, profession, title, time, url]
                        else:
                            if title in titles:
                                print "dup title"
                            uniqueCount+=1
                            print "unique count", uniqueCount
                            alreadydownloaded.append(l)
                            #print outputArray
                            #print [area, profession, title, time, url]
                            spamwriter.writerow(outputArray)
                        if limit > 0 and len(data) >= limit:
                            return data
        #return data

timestamped_filename = str(datetime.datetime.now()).replace("-", "_")
currentdate = datetime.datetime.now().date()


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
       
       print city
       titles = []
       outputfile = open(timestamped_filename+".csv","wb")
       spamwriter = csv.writer(outputfile)
       spamwriter.writerow("header")
       download_craigslist(int(page_count), int(limit))
	
    elif len(sys.argv) >= 2 and sys.argv[1] == "serve":
        print "Server not implemented yet."
    else:
        print """
Usage crawler: 
    python craigslist.py crawl <page_count> <limit>

Usage server:
    python craigslist.py serve
        """
        