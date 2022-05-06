# vim ft:dockerfile
FROM node:16

# App directory
WORKDIR /app

# Copy and install app dependencies
COPY package*.json ./
RUN npm ci --loglevel verbose

# Bundle app source
COPY . .

EXPOSE 4173
CMD ["./docker-entrypoint.sh"]
