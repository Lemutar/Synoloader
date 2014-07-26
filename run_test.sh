#!/bin/sh

# pull the svn files


rm ./firefox_profile/  -rf
firefox -CreateProfile "Synoloader_Test $PWD/firefox_profile" -no-remote
mkdir ./firefox_profile/extensions
mkdir ./firefox_profile/extensions/lemutar@gmail.com
cp ./src/* ./firefox_profile/extensions/lemutar@gmail.com/ -rf
cp ./firefox_profile_config/prefs.js ./firefox_profile/prefs.js

cd ..
echo "TESTING"
#ruby fire-test-runner --port=9999 --wait=20 --profile="firefox_profile"  ./test/ 

