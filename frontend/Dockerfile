FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install -g http-server

COPY . .

EXPOSE 63343

CMD ["npm", "start"]