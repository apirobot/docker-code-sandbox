FROM node:9

COPY ./shared /usr/src/app

RUN ["adduser",  "--home",  "/usr/src/app", "--system", "sandboxuser"]
RUN ["chown", "-R", "sandboxuser", "/usr/src/app"]
RUN ["chmod", "-R", "u+rwx", "/usr/src/app"]

RUN cd /usr/src/app && npm install

COPY start.sh /
RUN chmod 755 /start.sh

RUN apt-get update

# Install python 3
RUN apt-get install -y python3

# Install java
RUN apt-get install -y python-software-properties software-properties-common
RUN echo "deb http://ppa.launchpad.net/webupd8team/java/ubuntu xenial main" | tee /etc/apt/sources.list.d/webupd8team-java.list
RUN echo "deb-src http://ppa.launchpad.net/webupd8team/java/ubuntu xenial main" | tee -a /etc/apt/sources.list.d/webupd8team-java.list
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys EEA14886
RUN apt-get update
RUN echo oracle-java8-installer shared/accepted-oracle-license-v1-1 select true | /usr/bin/debconf-set-selections
RUN apt-get install -y oracle-java8-installer

# Install mono
RUN apt-get install -y mono-devel

# Install PHP
RUN apt-get install -y php5-cli

CMD ["/start.sh"]
