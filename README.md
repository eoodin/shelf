Introuduction
=============
Shelf is aiming to provide basic management interface for SCRUM.

TODOs
=====

- [x] split client and server
- [x] add sequelize migration setup for database
- [ ] ~~~unify items~~~
- [ ] add tag system
- [ ] * redesign history of items
- [x] show history in defect details
- [ ] \(Optional) add search engine
- [ ] add filters for defect
- [ ] code track system
- [ ] ci track system
- [ ] task automation
- [ ] effort statistics

Runtime setup
=============
1. Shelf was created purely by javascript, nodejs(lang level ES6) and npm are used
2. Shelf requires angular-cli to run the server, install it globally would be handly:
   npm install -g angular-cli

3. Shelf need a database, you may setup mysql5.x as database. 
   By default the schema name is shelf, credentials should be root/123456. You may change sequelize    configuration for your own database and schema.

Run server
==========
Shelf divided into frontend and backend server in sub folder respectively as npm projects, you need to run them separately.
1. Start the backend:
<backend subfolder> $ npm start

2. Start the frontend
<frontend subfolder> $ npm start

You may want to run them in backend at once, then you probably need a simple shell script on Linux:
 nohup npm start &> /dev/null &

Technical introduction
======================
1. [Angular2 https://angular.io] is used for front-end framework.
