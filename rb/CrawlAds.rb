#!/usr/bin/env ruby
require 'rubygems'
require 'curb'

MyResponse = Struct.new(:url, :code, :body, :time)

responses = []
requests = [
'http://ads.nao.ac.jp/cgi-bin/basic_connect?qsearch=Iyemori&version=1'
]

puts "Start"
time_begin = Time.now

m = Curl::Multi.new
m.pipeline = true

requests.each do |url|
  m.add(
        Curl::Easy.new(url) do |curl|
          curl.follow_location = true
          curl.on_complete do |ch|
            responses << MyResponse.new(url, ch.response_code, ch.body_str, ch.total_time)
          end
        end
        )
end

m.perform do
  puts "idling... can do some work here, including add new requests"
end

responses.each do |res|
  puts res.url
  puts " code = #{res.code}"
  puts " body.size = #{res.body.size}"
  puts " time = #{res.time}"
  puts '---'
end

puts re

puts "End time:#{Timenow - time_begin}"
puts
