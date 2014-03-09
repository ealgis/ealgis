#!/bin/bash

DONE="$HOME/pre-puppet-done"

if [ -f "$DONE" ]; then
    exit 0
fi

puppet=`which puppet`

sudo "$puppet" module install puppetlabs/apt &&
sudo "$puppet" module install puppetlabs/postgresql &&
sudo "$puppet" module install softek/java7

# apt::ppa puppet module needs to install python-software-properties
# which can't work without this
sudo apt-get update
touch "$DONE"

