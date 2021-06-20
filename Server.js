const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
const User = require('./User.js');
const Content = require('./Content.js');
const Person = require('./Person.js');
const Element = require('./Element.js');
const AwardNews = require('./AwardNews');

const config = {
  user: 'testmovie',
  password: 'testmovie',
  connectString: 'localhost:1521/xe'
}

const oracledb = require('oracledb');
const { group } = require('console');
oracledb.autoCommit = true;

async function querry() {
  let conn;

  try {
    
    conn = await oracledb.getConnection(config);
    getdata();
    let result = await conn.execute(
      `Select * from plots`,
    );
    
    console.log(result.rows);
    
    
  } catch (err) {
    console.log('Ouch!', err)
  } finally {
    if (conn) { // conn assignment worked, need to close
      
      await conn.close()
    }
  }
}

async function init() {
  try {
    const pool = await oracledb.createPool({
      user: config.user,
      password: config.password,
      connectString: config.connectString,
      poolMin: 10,
      poolMax: 10,
      poolIncrement: 0,
      poolTimeout: 60
    });

    
    //Create HTTP server and listen on port httpPort

    app.get('/register', (req, res) => res.sendStatus(200));
    app.post('/register', (req, res) => User.registerUser(req, res, pool));
    app.get('/signin', (req, res) => res.sendStatus(200));
    app.post('/signin', (req, res) => User.signInUser(req, res, pool));
    app.post('/editprofile', (req, res) => User.editUser(req, res, pool));
    app.get('/getrecommended', (req, res) => Content.getRecommended(req, res, pool));
    app.post('/addContent', (req, res) => Content.addContent(req, res, pool));
    app.post('/search', (req, res) => Content.search(req, res, pool));
    app.post('/addPersonLink', (req, res) => Person.addPersonLink(req, res, pool));
    app.post('/removePersonLink', (req, res) => Person.removePersonLink(req, res, pool));
    app.post('/addElement', (req, res) => Element.addElement(req, res, pool));
    app.post('/removeElement', (req, res) => Element.removeElement(req, res, pool));
    app.post('/getContentDetails', (req, res) => Content.getContentDetails(req, res, pool));
    app.post('/addTVDetail', (req, res) => Element.addTVDetail(req, res, pool));
    app.post('/removeTVDetail', (req, res) => Element.removeTVDetail(req, res, pool));
    app.post('/getContentData', (req, res) => Content.getContentData(req, res, pool));
    app.post('/editContentData', (req, res) => Content.editContentData(req, res, pool));
    app.post('/deleteContentData', (req, res) => Content.deleteContentData(req, res, pool));
    app.post('/addCelebrity', (req, res) => Person.addCelebrity(req, res, pool));
    app.post('/removeCelebrity', (req, res) => Person.removeCelebrity(req, res, pool));
    app.post('/editCelebrity', (req, res) => Person.editCelebrity(req, res, pool));
    app.post('/getCelebrity', (req, res) => Person.getCelebrity(req, res, pool));
    app.post('/addCelebrityPicture', (req, res) => Person.addCelebrityPicture(req, res, pool));
    app.post('/removeCelebrityPicture', (req, res) => Person.removeCelebrityPicture(req, res, pool));
    app.post('/removeCelebrityPicture', (req, res) => Person.removeCelebrityPicture(req, res, pool));
    app.post('/addAwardEvent', (req, res) => AwardNews.addAwardEvent(req, res, pool));
    app.post('/addNews', (req, res) => AwardNews.addNews(req, res, pool));
    
  const httpPort = 4000;
    app.listen(httpPort);
    console.log("Server is running at http://localhost:" + httpPort);
  } catch (err) {
    console.error("init() error: " + err.message);
  } 
}


async function closePoolAndExit() {
  console.log("\nTerminating");
  try {
    // Get the pool from the pool cache and close it when no
    // connections are in use, or force it closed after 10 seconds.
    
    await oracledb.getPool().close(10);
    console.log("Pool closed");
    process.exit(0);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

process
  .once('SIGTERM', closePoolAndExit)
  .once('SIGINT',  closePoolAndExit);

init();

