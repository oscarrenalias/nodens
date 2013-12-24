FROM ubuntu:latest

# Update the APT cache
RUN sed -i.bak 's/main$/main universe/' /etc/apt/sources.list
RUN apt-get update
RUN apt-get upgrade -y

# set up pre-requisites and folders
RUN apt-get install -y lsb-release supervisor openssh-server rsyslog git nodejs npm
RUN mkdir -p /var/run/sshd
RUN mkdir -p /var/log/supervisor
RUN locale-gen en_US en_US.UTF-8
ADD ./Docker/supervisord.conf /etc/supervisor/conf.d/supervisor.conf

# Set the root account password
RUN echo 'root:password' | chpasswd

# Hack for initctl
RUN dpkg-divert --local --rename --add /sbin/initctl
RUN ln -s /bin/true /sbin/initctl

# Install nodens
ADD . /opt/nodens

# Pull its dependencies via npm
RUN cd /opt/nodens && npm install

# Expose the ports used by nodens and SSHD
EXPOSE 15353 8053 22

# Start the supervisord
CMD ["/usr/bin/supervisord"]
