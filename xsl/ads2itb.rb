#!/usr/bin/env ruby
filename = ARGV[0]
file = open(filename)
text = file.read
file.close
#
# title
#
pos1 = text.index("<meta name=\"dc.title\" content=\"")
pos2 = text.index("<meta name=\"dc.creator\"")
title = text[pos1,pos2-pos1]
title = title.gsub("<meta name=\"dc.title\" content=\"","")
title = title.gsub("\" />","")
print "#title=",title
#
# abstract
#
pos1 = text.index("Abstract</h3>")
pos2 = text.rindex("<table width=100\%>")
abstract = text[pos1,pos2-pos1]
abstract = abstract.gsub("Abstract</h3>","")
abstract = abstract.gsub("<hr>","")
abstract = abstract.gsub("\n","")
print "b1=",abstract
