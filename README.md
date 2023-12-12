# Comic Reading Website
 Final Project for CSS326-Database Programming, a course at SIIT.

This project is a website to demonstrate the CRUD APIs for a web application using MySQL Database. The website is a comic reading website where users can login and enjoy comic books online. The website is created using React Frontend, NodeJS Backend, and MysqlDB.

To setup the project:
1. Pull the repository onto your local machine.
2. Create a new Database Schema in MySQL using your preferred tool (MySQL Workbench, phpMyAdmin, etc.) and import sql file comic_reading.sql into it.
3. (Optional) Create a new user for this database with at least the permissions to SELECT, INSERT, UPDATE, DELETE, EXECUTE.
4. Edit the .env file in the root folder which would look like this
```
HOST =              #db server host address
USERNAME =          #db username
PASSWORD =          #db password
DATABASE =          #database name
PASS_AES_KEY =      #Password for encryption
```
Note: The PASS_AES_KEY is the password used in encrypting the password of website users which can be set to any string.

5. To run the website, open a terminal inside the root folder and use command
```
node app.js
```
This would start up the backend application on port 3000.

Note: If you want to use another port, please edit the port variable inside app.js at the root folder as well as the .env file of the frontend which is located at ./commicweb-app 2/.env
   
6. Lastly, open another terminal inside commicweb-app 2 folder and use command
```
npm start
```
Likewise, the frontend port by default is set to 5173 which you can edit at ./ commicweb-app 2/.env

7. To fully utilize the website, register a new user then go into MySQL Database and add the user_id from the user table to the admin table to turn any user into an admin. Admins can access a new separated admin page where they can add new books, edit existing books, and delete any books.


Additional Information: You can import the file Comic Website API.postman_collection.json into postman to try out just the backend portion alone.
