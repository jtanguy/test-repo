const express = require('express')
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const _ = require('lodash')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const multer  = require('multer')
const path = require('path')
const fs = require('fs')
const env = require('common-env')()

const app = express()
const upload = multer({ dest: 'uploads/' })
const adapter = new FileSync('./.data/db.json')
const db = low(adapter)

const jwt = require('jsonwebtoken')
const {MacaroonsBuilder: Macaroon, MacaroonsVerifier: Verifier } = require('macaroons.js');

const config = env.getOrElseAll({
  default: {
    user: 'jtanguy',
    password: 'testtest'
  },
  secret: "thisisaverysecuresecret",
  project_domain: 'Devoxx - JWT Macaroons',
  project_url: "labs.jtanguy.me",
  port: 8080
});



db.defaults({users: [{ username: config.default.user, password: config.default.password}]}).write();

app.use(express.static('public'));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(cookieParser());


app.set('view engine', 'pug');
app.locals.title = config.project_domain;

app.get("/", (req, res) => {
  res.render('index.pug');
});

app.get("/users", (req, res) => {
  const users = db.get('users').value();
  res.send(users);
});

app.post('/login', (req, res) => {
  const user = db.get('users').find({username: req.body.username}).value();
  if(_.isUndefined(user)){
     res.sendStatus(404);
  } else if(_.get(user, 'password', null) !== req.body.password){
    res.sendStatus(401);
  } else {
    const token = jwt.sign({sub: user.username}, config.secret);
    res.cookie('jwt', token, {expiresIn: '1h'});
    res.redirect('/uploads');
  }
});

app.get('/logout', (req, res) => {
  res.clearCookie('jwt');
  res.redirect('/');
});

app.use((req, res, next) => {
  const token = req.cookies.jwt;
  if(_.isUndefined(token)){
    next()
  } else {
    jwt.verify(token, config.secret, (err, decoded) => {
      if(_.isUndefined(decoded)){
        res.clearCookie('jwt');
        res.sendStatus(401);
      } else {
        req.user = { username: decoded.sub };
        next();
      }
    });
  }
});

const required = (req, res, next) => {
  if(_.isUndefined(req.user)){
    res.sendStatus(401);
  } else {
    next();
  }
}


app.get('/uploads', required, (req, res) => {
  const files = db.get('files').filter({owner: req.user.username}).value();
  res.render('files.pug', {user: req.user, files: files});
});

app.post("/uploads", required, upload.array('uploads', 5), (req, res) => {
  console.log(`Uploading ${req.files.length} files for user ${req.user.username}`);
  const result = _.map(req.files, f => {
    return db.get('files').push({
      id: f.filename,
      name: f.originalname,
      path: f.path,
      mimetype: f.mimetype,
      size: f.size,
      owner: req.user.username
    }).write()
  });
  res.status(201).redirect('/uploads');
});

app.get('/view/:id', (req, res) => {
  const file = db.get('files').find({id: req.params.id}).value();

  if(_.isUndefined(file)){
    res.sendStatus(404);
  } else {
    if(!_.isUndefined(req.user) && file.owner === req.user.username){
      // Owner, give it
      const m = new Macaroon(config.project_url, config.secret, 'env')
        .add_first_party_caveat(`file=${file.id}`)
        .getMacaroon();
      res.render('file.pug', {file: file, macaroon: m.serialize()})
    } else if(!_.isUndefined(req.query.token)){

      const m = Macaroon.deserialize(req.query.token);
      const v = new Verifier(m);
      v.satisfyExact(`file=${file.id}`);
      const validMacaroon = v.isValid(config.secret);

      if(validMacaroon){
        // Not owner but valid macaroon
        res.render('file.pug', {file: file, macaroon: req.query.token})
      } else {
        // Not owner and invalid macaroon
        res.sendStatus(401);
      }

    } else if(!_.isUndefined(req.user)){
      // Logged in user
      res.sendStatus(403);
    } else {
      // No auth
      res.sendStatus(401);
    }

  }
});
app.get('/uploads/:id', (req, res) => {
  const file = db.get('files').find({id: req.params.id}).value();

  if(_.isUndefined(file)){
    res.sendStatus(404);
  } else {
    if(!_.isUndefined(req.user) && file.owner === req.user.username){
      // Owner, give it
      res.type(file.mimetype).sendFile(path.join(__dirname, file.path));
    } else if(!_.isUndefined(req.query.token)){

      const m = Macaroon.deserialize(req.query.token);
      const v = new Verifier(m);
      v.satisfyExact(`file=${file.id}`);
      const validMacaroon = v.isValid(config.secret);

      if(validMacaroon){
        // Not owner but valid macaroon
        res.type(file.mimetype).sendFile(path.join(__dirname, file.path));
      } else {
        // Not owner and invalid macaroon
        res.sendStatus(401);
      }

    } else if(!_.isUndefined(req.user)){
      // Logged in user
      res.sendStatus(403);
    } else {
      // No auth
      res.sendStatus(401);
    }

  }
});

app.get('/uploads/:id/share', (req, res) => {
  const file = db.get('files').find({id: req.params.id}).value();
  if(_.isUndefined(file)){
    res.sendStatus(404);
  } else if(file.owner !== req.user.username){
    res.sendStatus(403);
  } else {
    const m = new Macaroon(config.project_url, config.secret, 'env')
      .add_first_party_caveat(`file=${file.id}`)
      .getMacaroon();
    res.send(`/uploads/${file.id}?token=${m.serialize()}`);
  }
});


app.delete('/uploads/:id', required, (req, res) => {
  const file = db.get('files').find({id: req.params.id}).value();
  if(_.isUndefined(file)){
    res.sendStatus(404);
  } else if(file.owner !== req.user.username) {
    res.sendStatus(403);
  } else {
    fs.unlink(file.path, () => {
      db.get('files').remove({id: req.params.id}).write();
      res.status(204).end()
    })
  }
});


// listen for requests :)
const listener = app.listen(config.port, () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
  console.log(`Currently registered users: ${db.get('users').map('username').value()}`);
})
