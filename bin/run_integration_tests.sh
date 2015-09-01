#!/bin/sh

FirefoxBin=${FirefoxBin-firefox}

echo "SETTING UP PROFILE"
FirefoxProfileTest="$PWD/firefox_profile_test"
rm -rf $FirefoxProfileTest

$FirefoxBin -CreateProfile "synoloader_profile_test $FirefoxProfileTest" -no-remote
cp -rf firefox_profile_config/prefs.js $FirefoxProfileTest/

mkdir -p $FirefoxProfileTest/extensions
cp -rf ../src $FirefoxProfileTest/extensions/lemutar@gmail.com
cp -rf firefox_profile_config/uxu@clear-code.com $FirefoxProfileTest/extensions/

echo "TESTING"
./fire-test-runner --port=9999 --firefox="'$FirefoxBin'" --profile="$FirefoxProfileTest" --quit ../tests-integration/;
