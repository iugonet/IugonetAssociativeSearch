#!/usr/bin/env bash

if [ -a 'list.txt' ]; then
    rm list.txt
fi 

if [ -a 'createItb.sh' ]; then
    rm createItb.sh
fi

../rb/getAdsPaperListOnGoogleSpreadSheet.rb
echo "#!/usr/bin/env bash" > createItb.sh
cat list.txt | awk '{print "curl -o index.html -O ",$0,"; cat index.html"}' >> createItb.sh
chmod +x createItb.sh
