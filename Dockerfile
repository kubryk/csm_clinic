# Use Node.js 18
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies
RUN apk add --no-cache libc6-compat

# Copy package files
COPY package.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Set environment variables for build
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV POSTGRES_URL=postgres://postgres:postgres@postgres:5432/csm_clinic_dashboard
ENV AUTH_SECRET=build-secret
ENV BASE_URL=http://localhost:3000

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]