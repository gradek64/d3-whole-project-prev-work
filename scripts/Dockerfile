ARG NODE_ENV
ARG ALPINE_VERSION=3.2
FROM alpine:$ALPINE_VERSION

USER root

WORKDIR /tmp

ENV NGINX_VERSION=1.12.1

# Install nginx
RUN apk update
RUN apk add nginx
RUN rm -rf /var/cache/apk/*

# Remove the default Nginx configuration file
RUN rm -v /etc/nginx/nginx.conf

# Copy a configuration file from the current directory
COPY scripts/nginx.conf /etc/nginx/nginx.conf

# Copy files into nginx
RUN rm -rf /usr/share/nginx/html/*
COPY src/ /usr/share/nginx/html/
COPY customized-vendors/ /usr/share/nginx/html/

# Expose ports
EXPOSE 8080

# Start nginx
CMD ["nginx"]
