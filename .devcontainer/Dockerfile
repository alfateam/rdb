# FROM node:18-alpine
FROM mcr.microsoft.com/vscode/devcontainers/javascript-node:0-20-bullseye


# [Optional] Uncomment this section to install additional OS packages.
# RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
#     && apt-get -y install --no-install-recommends <your-package-list-here>

# [Optional] Uncomment if you want to install an additional version of node using nvm
# ARG EXTRA_NODE_VERSION=10
# RUN su node -c "source /usr/local/share/nvm/nvm.sh && nvm install ${EXTRA_NODE_VERSION}"

#alpine
# RUN apk update
# RUN apk add git
# RUN apk add libnsl
# RUN apk add gcompat
# RUN ln -s /usr/lib/libnsl.so.3 /usr/lib/libnsl.so.1
# RUN apk --no-cache add curl
# RUN apk --no-cache add unixodbc
# RUN apk add sudo
# odbc alpine
# https://docs.microsoft.com/en-us/sql/connect/odbc/linux-mac/installing-the-microsoft-odbc-driver-for-sql-server?view=sql-server-ver16
# RUN curl -O https://download.microsoft.com/download/b/9/f/b9f3cce4-3925-46d4-9f46-da08869c6486/msodbcsql18_18.1.1.1-1_amd64.apk
# RUN curl -O https://download.microsoft.com/download/b/9/f/b9f3cce4-3925-46d4-9f46-da08869c6486/mssql-tools18_18.1.1.1-1_amd64.apk
# RUN sudo apk add --allow-untrusted msodbcsql18_18.1.1.1-1_amd64.apk
# RUN sudo apk add --allow-untrusted mssql-tools18_18.1.1.1-1_amd64.apk

#debian
RUN curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add -
RUN curl https://packages.microsoft.com/config/debian/11/prod.list > /etc/apt/sources.list.d/mssql-release.list
RUN apt-get update
RUN sudo ACCEPT_EULA=Y apt-get install -y msodbcsql18
#RUN echo 'export PATH="$PATH:/opt/mssql-tools18/bin"' >> ~/.bashrc
#RUN ~/.bashrc
RUN apt-get install -y unixodbc-dev

# RUN mkdir -p /usr/config
# WORKDIR /usr/config

# Bundle config source
# COPY . /usr/config

# Grant permissions for to our scripts to be executable
# USER root
# RUN chmod +x /usr/config/configure-db.sh
# RUN chmod +x /usr/config/configure-db-local.sh

# ENTRYPOINT ["./configure-db-local.sh"]
