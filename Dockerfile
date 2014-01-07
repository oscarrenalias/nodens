# Create a docker image to run nodens by Oscar Renalias
FROM ubuntu:precise

# Update the APT cache
RUN sed -i.bak 's/main$/main universe/' /etc/apt/sources.list
RUN apt-get update
RUN apt-get upgrade -y

# Hack for initctl
RUN dpkg-divert --local --rename --add /sbin/initctl
RUN ln -s /bin/true /sbin/initctl

# Install and setup project dependencies
RUN apt-get install -y curl lsb-release supervisor openssh-server rsyslog net-tools
RUN mkdir -p /var/run/sshd
RUN mkdir -p /var/log/supervisor
RUN locale-gen en_US en_US.UTF-8
#RUN echo "LC_ALL=C" > /etc/default/locale 
ADD Docker/supervisord.conf /etc/supervisor/conf.d/supervisor.conf
# Set the root account password
RUN echo 'root:password' | chpasswd

# Expose the current folder as /opt/nodens
ADD . /opt/nodens

# Install node, npm
RUN apt-key adv --keyserver keyserver.ubuntu.com --recv-keys C7917B12
RUN echo "deb http://ppa.launchpad.net/chris-lea/node.js/ubuntu $(lsb_release -cs) main" > /etc/apt/sources.list.d/node.list
RUN apt-get update
RUN apt-get -y install nodejs

# Check out the project from github and build it
RUN cd /opt/nodens && npm install
# In case it's not there yet
RUN mkdir -p /opt/nodens/db

# Expose the ports
EXPOSE 22 8053 15353

# Start the supervisord
CMD ["/usr/bin/supervisord"]
