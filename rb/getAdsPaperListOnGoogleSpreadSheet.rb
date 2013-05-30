#!/usr/bin/env ruby
require 'rubygems'
require "google_spreadsheet"
require 'rexml/document'
require 'net/http'

doc = REXML::Document.new(open("../conf/GoogleAccount.xml"))

USER = doc.elements['GoogleAccount/user'].text
PASS = doc.elements['GoogleAccount/password'].text
print "AAAA"
print "BBBB"
exit(1)
if (USER == "" || PASS == "") then
  print "Please speficy USER & PASS in GoogleAccount.xml"
  exit(1)
end
URL = "https://docs.google.com/spreadsheet/ccc?key=0AgbaOOcOsZncdE5sOFJySXFOdnNRMXBoMnQ5MFJLRmc#gid=0"

session = GoogleSpreadsheet.login(USER, PASS)
ws = session.spreadsheet_by_url(URL).worksheets[0]

1.upto(ws.num_rows){|i|
  print "http://adsabs.harvard.edu/abs/", ws[i, 1],"\n"
}

#print ws.cells

