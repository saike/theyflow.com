import express from 'express';

//config
import CONFIG from './config';

//utils
import body_parser from 'body-parser';
import cookie_parser from 'cookie-parser';
import Render from 'express-es6-template-engine';
import session from 'express-session';
import connect_mongo from 'connect-mongo';
const MongoStore = connect_mongo(session);

//database
import mongoose from 'mongoose';

//routes
import MocksRoutes from './routes/mocks';
import AuthRoutes from './routes/auth';

//home controller

const app = express();

//connect to database
mongoose.connect([ CONFIG.MONGODB.HOST, CONFIG.MONGODB.DATABASE_NAME ].join('/'), (err) => {

  if(err) throw err;

  console.log('mongo connected');

});

//use es6 template render
app.engine('html', Render);
app.set('views', '../client');
app.set('view engine', 'html');

//static server
app.use(express.static('../client'));

//request parsers
app.use(body_parser.json());
app.use(body_parser.urlencoded({extended: true}));

app.use(cookie_parser()); // read cookies (needed for auth)

//authorization middlewares
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: CONFIG.SECRET,
  store: new MongoStore({ mongooseConnection: mongoose.connection })
}));

app.use('/mocks', MocksRoutes);
app.use('/auth', AuthRoutes);

app.all('/*', (req, res, next) => {
  res.render('index', {});
});


app.listen(CONFIG.PORT, function () {
  console.log(`Example app listening on port: ${CONFIG.PORT}`);
});
