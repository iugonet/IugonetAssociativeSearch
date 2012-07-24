#!/usr/bin/env ruby
filename = ARGV[0]
file = open(filename)
text = file.read
print text
file.close

pos = text.index("<h3 align=\"center\">                               Abstract</h3>")
print pos
pos2 = text.index("<hr>\n<table width=100\%>")
print pos2
print text[$pos2,$pos1]
