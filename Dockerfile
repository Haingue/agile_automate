###################
# BUILD FOR LOCAL DEVELOPMENT
###################
FROM node:18-alpine As development
WORKDIR /usr/src/app
COPY --chown=node:node package*.json ./
RUN npm ci
COPY --chown=node:node . .
USER node

###################
# BUILD FOR PRODUCTION
###################
FROM node:18-alpine As build
WORKDIR /usr/src/app
COPY --chown=node:node package*.json ./
COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules
COPY --chown=node:node . .
# ENV ATLASSIAN_TOKEN ''
# ENV CONFLUENCE_BASEURL ''
# ENV CONFLUENCE_SPACE_KEY ''
# ENV JIRA_BASEURL ''
# ENV JIRA_SPACE_KEY ''
RUN npm run build
ENV NODE_ENV production
RUN npm ci --only=production && npm cache clean --force
USER node

###################
# PRODUCTION
###################
FROM node:18-alpine As production
COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist
EXPOSE 3000
CMD [ "node", "dist/main.js" ]
