#!/bin/sh

# pull the svn files
cd src

rm /lemutar@gmail.com/* -rf
cp ./* ../firefox_profile/extensions/lemutar@gmail.com/ -rf

cd ..
./fire-test-runner --profile="firefox_profile" --quit --close-main-windows ./test/ 
#node uxu2junit.js

