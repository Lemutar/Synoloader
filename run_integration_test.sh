#!/bin/sh

#FirefoxTest="/Applications/Firefox.app/Contents/MacOS/firefox"

echo "SETTING UP PROFILE"
rm -rf firefox_profile

if [ -z "$FirefoxTest" ];
then firefox -CreateProfile "Synoloader_Test $PWD/firefox_profile" -no-remote
else $FirefoxTest -CreateProfile "Synoloader_Test $PWD/firefox_profile" --no-remote
fi

mkdir -p firefox_profile
mkdir -p firefox_profile/extensions
mkdir -p firefox_profile/extensions/lemutar@gmail.com
cp -rf src/* firefox_profile/extensions/lemutar@gmail.com/
cp firefox_profile_config/prefs.js firefox_profile/
cp -rf firefox_profile_config/uxu@clear-code.com firefox_profile/extensions/

echo "TESTING"
if [ -z "$FirefoxTest" ];
then ./fire-test-runner --port=9999 --profile="firefox_profile" --quit ./Integration/;
else ./fire-test-runner --port=9999 --firefox="'$FirefoxTest'" --profile="firefox_profile" --quit ./Integration/;
fi
