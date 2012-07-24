#!/usr/bin/env bash
cat 1996AnGeo..14..608I | grep dc.title | awk '{print substr($0,index($0,"content=\"")+9,index($0,"\" />")-(index($0,"content=\"")+9))}'
