#!/bin/bash

#
# This is the script that configures the Vagrant box to host Docker containers for NodeNS
#

# configure apt
echo "Installing the Docker GPG key for apt"
wget -qO- https://get.docker.io/gpg | apt-key add -

# add the docker key and repos, and install docker
echo "Adding the Docker apt source"
echo deb http://get.docker.io/ubuntu docker main > /etc/apt/sources.list.d/docker.list
echo "Running apt-get update"
apt-get update
echo "Installing docker"
# TODO: 0.7.3 currently has a regression that causes commands that use apt-get to fail in the container...
# See https://github.com/dotcloud/docker/issues/3449. Downgrading to 0.7.2 fixes the issue, so we'll
# stick to that for the time being
apt-get install -y lxc-docker-0.7.2
echo "Done"