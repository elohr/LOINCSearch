FROM 550046995570.dkr.ecr.us-east-1.amazonaws.com/checkup/nodejs

# Bundle app source
COPY . /src

# Install app dependencies
WORKDIR /src
RUN npm install

EXPOSE 3001

CMD ["npm", "start"]