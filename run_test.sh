#!/bin/sh

# pull the svn files


rm ./firefox_profile/  -rf
firefox -CreateProfile "Synoloader_Test $PWD/firefox_profile" -no-remote
mkdir ./firefox_profile/extensions
mkdir ./firefox_profile/extensions/lemutar@gmail.com
cp ./src/* ./firefox_profile/extensions/lemutar@gmail.com/ -rf
cp ./firefox_profile_config/prefs.js ./firefox_profile/prefs.js
cp ./firefox_profile_config/uxu@clear-code.com ./firefox_profile/extensions/ -rf



echo "TESTING"
if [ -z "$FirfoxTest" ]; 
then ./fire-test-runner --port=9999  --profile="firefox_profile"  ./test/ --quit; 
else ./fire-test-runner --port=9999   --firefox="'$FirfoxTest'" --profile="firefox_profile" ./test/ --quit; 
fi

#firefox -profile ./firefox_profile -no-remote




