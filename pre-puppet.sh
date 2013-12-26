#!/bin/bash

DONE="$HOME/pre-puppet-done"

if [ -f "$DONE" ]; then
    exit 0
fi

sudo /opt/ruby/bin/puppet module install puppetlabs/apt &&
sudo /opt/ruby/bin/puppet module install puppetlabs/postgresql

# apt::ppa puppet module needs to install python-software-properties
# which can't work without this
sudo apt-get update
touch "$DONE"

