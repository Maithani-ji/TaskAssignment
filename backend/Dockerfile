FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install --production

# Install PM2 globally
RUN npm install pm2 -g

# Copy entire project
COPY . .

# 👇 Generate Prisma client using correct schema path
RUN npx prisma generate --schema=src/prisma/schema.prisma

# Expose the port your app runs on
EXPOSE 3000

# Start the app using PM2
CMD ["pm2-runtime", "ecosystem.config.json"]
