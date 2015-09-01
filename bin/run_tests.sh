#!/bin/sh

echo "Getting which test to run"

case "${1-default}" in
  default) TestToRun="Run default tests"; TestsFolder="../tests/" ;;
  integration) TestToRun="Run integration tests"; TestsFolder="../tests-integration" ;;
  local-integration) TestToRun="Run local integration tests"; TestsFolder="../tests-integration-local" ;;
  *) echo "Invalid option. Valid are: default (or empty), integration, local-integration"; exit 1 ;;
esac


echo "Getting firefox binary"

FirefoxBin=${2-$FirefoxBin}
FirefoxBin=${FirefoxBin-firefox}

if [[ -z "$(which $FirefoxBin)" ]]; then
  echo "No firefox binary found. Either set the FirefoxBin environment variable or pass the path to the binary as the second parameter."
  exit 1
fi


echo "Setting up firefox profile"

FirefoxProfileTest="$PWD/firefox_profile_test"
rm -rf $FirefoxProfileTest

$FirefoxBin -CreateProfile "synoloader_profile_test $FirefoxProfileTest" -no-remote
cp -rf firefox_profile_config/prefs.js $FirefoxProfileTest/

echo "Adding required extensions"

mkdir -p $FirefoxProfileTest/extensions
cp -rf ../src $FirefoxProfileTest/extensions/lemutar@gmail.com
cp -rf firefox_profile_config/uxu@clear-code.com $FirefoxProfileTest/extensions/


echo $TestToRun

./fire-test-runner --port=9999 --firefox="'$FirefoxBin'" --profile="$FirefoxProfileTest" --quit $TestsFolder
