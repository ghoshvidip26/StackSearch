FROM node:20
WORKDIR /server
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build
EXPOSE 3000
CMD [ "node","dist/app.js" ]
