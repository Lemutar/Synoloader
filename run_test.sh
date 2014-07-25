#!/bin/sh

# pull the svn files
cd src

rm /lemutar@gmail.com/* -rf
cp ./* ../firefox_profile/extensions/lemutar@gmail.com/ -rf

cd ..
echo "TESTING"
ruby fire-test-runner --profile="firefox_profile"  ./test/ 

