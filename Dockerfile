FROM node:18-alpine

# Install Toxiproxy
RUN apk add --no-cache curl tar
RUN curl -L -o toxiproxy.tar.gz https://github.com/Shopify/toxiproxy/releases/download/v2.5.0/toxiproxy_2.5.0_linux_amd64.tar.gz \
    && tar -xf toxiproxy.tar.gz \
    && mv toxiproxy-server /usr/local/bin/ \
    && mv toxiproxy-cli /usr/local/bin/ \
    && rm toxiproxy.tar.gz

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm ci --only=production

# Bundle app source
COPY . .

# Set default environment variables
ENV PORT=3000
ENV TOXIPROXY_HOST=0.0.0.0
ENV TOXIPROXY_PORT=8474
ENV TOXIPROXY_CLI=toxiproxy-cli
ENV TOXIPROXY_SERVER=toxiproxy-server
ENV AUTO_START_SERVER=true
ENV LOG_LEVEL=info

# Expose ports for the API and Toxiproxy
EXPOSE 3000
EXPOSE 8474

# Start the app
CMD ["node", "index.js"]
