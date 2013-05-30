#!/usr/bin/env bash

if [ -a 'list.txt' ]; then
    rm list.txt
fi 

if [ -a 'createItb.sh' ]; then
    rm createItb.sh
fi

../rb/getAdsPaperListOnGoogleSpreadSheet.rb
echo "#!/usr/bin/env bash" > createItb.sh
if [ -a 'list.txt' ]; then
    cat list.txt | awk '{print "curl -o index.html -O ",$0,"; ../rb/adsMetadata2itb.rb index.html"}' >> createItb.sh
    chmod +x createItb.sh
fi

