ARG NODE_ENV=dev
FROM node:18
WORKDIR /usr/src/app
COPY package*.json ./
ENV NODE_ENV production
RUN npm ci
COPY . .
RUN npm run build
CMD [ "node", "dist/main.js" ]
