#!/bin/sh
for file in *.dic *.cha
do
if [ -f $file ]; then
echo $file
iconv -f euc-jp -t utf-8 $file > tmpfile
mv tmpfile $file
fi
done
exit