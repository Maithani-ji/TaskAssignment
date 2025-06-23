FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --production

RUN npm install pm2 -g

COPY . .

# 👇 Navigate to correct prisma directory to generate client
WORKDIR /usr/src/app/prisma
RUN npx prisma generate

# Back to app directory to run it
WORKDIR /usr/src/app

EXPOSE 3000

CMD ["pm2-runtime", "ecosystem.config.json"]