#!/bin/sh

# pull the svn files
cd src

rm ../firefox_profile/extensions/lemutar@gmail.com/* -rf
cp ./* ../firefox_profile/extensions/lemutar@gmail.com/ -rf

cd ..
echo "TESTING"
ruby fire-test-runner --port=9999 --wait=20 --profile="firefox_profile"  ./test/

