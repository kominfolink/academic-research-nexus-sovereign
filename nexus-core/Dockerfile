# Z374_LL4M4 CLOAKED SOVEREIGN ENGINE v11.0
FROM node:20-slim

# Install system dependencies for Playwright/Chromium
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    curl \
    git \
    libgbm1 \
    libasound2 \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxrandr2 \
    libgbm-dev \
    libpangocairo-1.0-0 \
    libpango-1.0-0 \
    libcairo2 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm install --production

# Install CloakBrowser Python package and binary
RUN pip3 install cloakbrowser --break-system-packages
RUN python3 -m cloakbrowser install

COPY . .
RUN chmod +x *.js

ENV PORT=7860
EXPOSE 7860

# Start both Server and Cloak Service
CMD ["npm", "start"]