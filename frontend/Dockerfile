# vim ft:dockerfile
FROM node:16

# App directory
WORKDIR /app

# Copy and install app dependencies
COPY package*.json ./

RUN npm install

# Production
# RUN NPM CI --only=production

# Bundle app source
COPY . .

EXPOSE 3000
CMD ["npm", "run", "dev"]
# Production
# CMD ["npm", "run", "preview"]
