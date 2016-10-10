Introuduction
=============
Shelf is aiming to provide basic management interface for SCRUM.


Runtime setup
=============
1. Shelf was created purely by javascript, nodejs and npm are used
2. Shelf requires angular-cli to run the server, install it globally would be handly:
   npm install -g angular-cli

3. Shelf need a database, you may setup mysql5.x as database. 
   By default the schema name is shelf, credentials should be root/123456. You may change sequelize    configuration for your own database and schema.

Run server
==========
Shelf consists of two parts, a server backend and a static fronted, you need to run them separately due to limitation bring by angular-cli.
1. Start the backend:
node server/index.js

2. Start the frontend
npm start

You may want to run them in backend at once, then you probably need a simple shell script on Linux:

 nohup node server/index.js &> server.log &
 nohup npm start &> /dev/null &

Technical introduction
======================
1. [Angular2 https://angular.io] is used for front-end framework.

