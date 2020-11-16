# Node JS API with authentication and JWT

### Initialize a project

Node.js® is required, download at https://nodejs.org/en/download/

From your terminal, create an empty folder and initialize a package.json

```console
mkdir node-authentication
cd node-authentication
npm init -y 
```

### Packages

To generate a package.json with the correct dependencies, run the follow command in your terminal

```console
npm i @hapi/joi bcryptjs dotenv express jsonwebtoken mongoose nodemon
```

Open your package.json and add nodemon index.js to the start key/value pair from scripts. Nodemon allows you to avoid manually restarting your server on changes.

```json
{
  "name": "nodejs-authentication",
  "version": "1.0.0",
  "description": "create an api for authenticating a user with nodeJS, express, mongodb and jwt",
  "main": "index.js",
  "scripts": {
    "start": "nodemon index.js"
  },
  "author": "",
  "license": "ISC",
  "dependencies": {
    "@hapi/joi": "^17.1.1",
    "bcryptjs": "^2.4.3",
    "dotenv": "^8.2.0",
    "express": "^4.17.1",
    "jsonwebtoken": "^8.5.1",
    "mongoose": "^5.10.14",
    "nodemon": "^2.0.6"
  }
}
```

### Initialize the server

Create an index.js file in your app folder and import dependencies

```javascript
const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv').config()
```

Instantiate an app from the express dependency and make sure the server can accept JSON format requests by adding 

```javascript
const app = express()
app.use(express.json())
```

Bind and listen for connections on the port 3000

```javascript
const port = 3000
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`)
})
```

On your terminal, run the following command and make sure the output is 'Server is listening on port 3000' 

```console
npm start
```

### Connect database

1. Go to **www.mongodb.com/**, register an account and sign in. Then, create a **cluster** using the sandbox database (free)

2. Click on **Database Access** underneath the security tab and create a user. Keep the user and password for connecting the database in step 5

3. In **Network Access**, make sure the database can be accessed from your IP

4. Go back to the cluster dashboard, click "Connect" and "Connect your application". 
You should have a link such as **mongodb+srv://USER:PASSWORD@cluster0.5trwy.mongodb.net/<dbname>?retryWrites=true&w=majority**

5. Back in your codebase, create a **.env file** and copy the following link without wrapping it in quotation mark : 
**DB_CONNECT=mongodb+srv://USER:PASSWORD@cluster0.5trwy.mongodb.net/<dbname>?retryWrites=true&w=majority**
Make sure to change USER and PASSWORD according to the Database Access user your created in step 2

6. In app.js, add the following

```javascript
mongoose.connect(
  process.env.DB_CONNECT, 
  { useNewUrlParser: true, 
    useUnifiedTopology: true 
  },
  () => console.log("Connected to my Mongodb database")
)
```

7. In your terminal, start your server and make sure the database is connected.

```console
npm start
```
