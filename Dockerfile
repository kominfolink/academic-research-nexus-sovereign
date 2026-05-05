# ACADEMIC_NEXUS_TOOLKIT v21.8 [ULTRA_STABLE]
FROM mcr.microsoft.com/playwright:v1.42.0-jammy

# Configure environment
WORKDIR /app
ENV PORT=7860
ENV NODE_ENV=production

# Install root dependencies
COPY package*.json ./
RUN npm install

# Install nested module dependencies
COPY nexus-core/package*.json ./nexus-core/
RUN cd nexus-core && npm install

# Copy source
COPY . .

# Healthcheck to prevent 503
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:7860/ || exit 1

EXPOSE 7860

# ORCHESTRATION
CMD ["sh", "-c", "node nexus-core/cloak_service.mjs & node server.js"]
