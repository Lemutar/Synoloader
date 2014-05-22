#!/bin/sh

# pull the svn files
cd src

rm /lemutar@gmail.com/* -rf
cp ./* ../firefox_profile/extensions/lemutar@gmail.com/ -rf

cd ..
firefox -uxu-start-server -uxu-listen-port 4444 -profile firefox_profile -no-remote -uxu-testcase "./test" -uxu-log ./test_result.json
node uxu2junit.js

