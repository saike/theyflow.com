import express from 'express';

//config
import CONFIG from './config';

//utils
import body_parser from 'body-parser';
import cookie_parser from 'cookie-parser';
import Render from 'express-es6-template-engine';

//database
import mongoose from 'mongoose';

//routes
import MocksRoutes from './routes/mocks';

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

app.use('/', MocksRoutes);

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
});