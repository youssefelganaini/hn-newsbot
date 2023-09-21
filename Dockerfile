# Use the current Node.js slim image as the base image
FROM node:current-slim

# Set the working directory inside the container
WORKDIR /news_alerts

# install dependencies for puppeteer to work with chromium
RUN apt-get update && apt-get install -yq \
    gconf-service \
    libasound2 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgcc1 \
    libgconf-2-4 \
    libgdk-pixbuf2.0-0 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libnss3 \
    lsb-release \
    xdg-utils \
    wget \
    gnupg \
    libatk-bridge2.0-0 \
    sqlite3

# copy dependencies from package.json and package-lock.json
COPY package*.json ./

# Set environment variable to skip downloading Chromium during Puppeteer installation, important for Apple Silicon
ENV PUPPETEER_SKIP_DOWNLOAD=true

# install the dependencies using npm, ignoring node_modules
RUN npm install

# Install Chromium browser (for arm64 architecture) on the host machine, and link it to the container
# ensure that you have Chromium installed on the host machine (for arm64 architecture)
RUN apt-get install -yq chromium

# Set the Puppeteer executable path to use the system-installed Chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Copy all the source files to the working directory
COPY . .

# Set the command to execute your Puppeteer script
CMD ["node", "index.js"]
