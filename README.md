## LOINCSearch
### Tech
**Front End:** React + Flux Project

**Backend:** Node.js and ElasticSearch

### Installation
After downloading the project run `npm install` to install the project dependencies.

ElasticSearch 2.0 is supposed to be running on `192.168.2.15:9200`, if not then update file `api/config/database.js`.

Also modify BASE_URL from `stores/SearchStore.jsx` to match the IP and Port of Node.js.

### Run
Use command `npm start` to run project. By default this will add all LOINC records to ES on start. If this was already done then project can be run with command `node api/server.js debug`.

### Project Structure
**Actions:** handle the methods executed by the components and sends them to the Flux Dispatcher.

**API:** the web service and files required to setup ES.

**Components:** the React components.

**Constants:** values used to name the actions.

**Dispatcher:** the Flux Dispatcher.

**Dist:** final files for the client web app.

**Stores:** React data stores.

**Styles:** SCSS files.
