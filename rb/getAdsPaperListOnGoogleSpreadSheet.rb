#!/usr/bin/env ruby
require 'rubygems'
require "google_spreadsheet"
require 'rexml/document'
require 'net/http'
require 'optparse'

doc = REXML::Document.new(open("../conf/GoogleAccount.xml"))
USER = doc.elements['GoogleAccount/user'].text
PASS = doc.elements['GoogleAccount/password'].text

URL = "https://docs.google.com/spreadsheet/ccc?key=0AgbaOOcOsZncdE5sOFJySXFOdnNRMXBoMnQ5MFJLRmc#gid=0"

opt = OptionParser.new
opt.on('-o','output-file-name') {|v| p v}

opt.parse!(ARGV)

def getAdsPaperListOnGoogleSpreadSheet()
  if ( USER.nil? || PASS.nil? ) then
    STDERR.puts "Please speficy USER & PASS in GoogleAccount.xml"
    exit(1)
  end

  session = GoogleSpreadsheet.login(USER, PASS)
  ws = session.spreadsheet_by_url(URL).worksheets[0]

  f = open('list.txt', 'w')
  1.upto(ws.num_rows){|i|
    f.write "http://adsabs.harvard.edu/abs/"+ws[i, 1]+"\n"
  }
  f.close
end

if ARGV.length == 1 then
  getAdsPaperListOnGoogleSpreadSheet()
else
  print "Usage: getAdsPaperListOnGoogleSpreadSheet [options]\n"
  print "    -o                               output-file-n\n"
end

