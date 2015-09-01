#!/bin/sh

cd ../src
rm Synoloader.xpi
zip -9 -r Synoloader.xpi .
cd ../bin
mv ../src/Synoloader.xpi .
