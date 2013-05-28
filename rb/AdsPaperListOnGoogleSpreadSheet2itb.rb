#!/usr/bin/env ruby
require 'rubygems'
require "google_spreadsheet"
require 'rexml/document'

doc = REXML::Document.new(open("../conf/GoogleAccount.xml"))

USER = doc.elements['GoogleAccount/user'].text
PASS = doc.elements['GoogleAccount/password'].text
URL = "https://docs.google.com/spreadsheet/ccc?key=0AgbaOOcOsZncdDFYa2xHd0puZnVBVUVwakp0bzJuVkE#gid=0"

session = GoogleSpreadsheet.login(USER, PASS)
ws = session.spreadsheet_by_url(URL).worksheets[0]

puts "@description=iugonet"
puts "@title=iugonet"

1.upto(ws.num_rows){|i|
  print "i",i,"\n"
  print "#title=", ws[i, 1],"\n"
  print "b1", ws[i, 2],"\n"
}

#print ws.cells

