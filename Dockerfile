# Build Image Base
FROM node:16.20-slim AS BUILD

# Install git and other necessary tools
RUN apt-get update && apt-get install -y git 

# Set Working Directory
WORKDIR /home/app

# Copy required files
COPY . ./

# Run Build Commands
RUN rm .gitignore
RUN rm -rf node_modules
RUN rm package-lock.json
RUN npm cache clear --force
RUN npm install -g npm@8
RUN npm config set legacy-peer-deps true
RUN npm install
RUN npm run build:uat

# Build Image Base
FROM nginx

# Copy static files to nginx
COPY --from=BUILD /home/app/dist/ usr/share/nginx/html
