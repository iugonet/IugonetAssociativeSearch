#!/usr/bin/env bash

if [ -a 'list.txt' ]; then
    rm list.txt
fi 

if [ -a '/tmp/createItb.sh' ]; then
    rm /tmp/createItb.sh
fi

../rb/getAdsPaperListOnGoogleSpreadSheet.rb
echo "#!/usr/bin/env bash" > /tmp/createItb.sh
echo "rm ../itb/ads.itb" >> /tmp/createItb.sh
echo "echo '@title=ADS' >> ../itb/ads.itb" >> /tmp/createItb.sh
echo "echo '@description=The dictionary generated from the metadata of SAO/NASA Astrophysics Data System' >> ../itb/ads.itb" >> /tmp/createItb.sh
if [ -a 'list.txt' ]; then
    cat list.txt | awk '{print "curl -o /tmp/index.html -O ",$0,"; ../rb/adsMetadata2itb.rb /tmp/index.html >> ../itb/ads.itb"}' >> /tmp/createItb.sh
    chmod +x /tmp/createItb.sh
    rm list.txt
fi

if [ -a '/tmp/createItb.sh' ]; then
    /tmp/createItb.sh
fi
