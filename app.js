const path = require('path');
const express = require('express');
const bodyParser = require('body-parser')
const morgan = require('morgan');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const compression = require('compression');
const accessControls = require('./middlewares/access-controls');

// Start express app
const app = express();

app.enable('trust proxy');
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

/*
  Global MiddleWares
*/
app.use(express.static(path.join(__dirname, 'public')));
app.use(accessControls);
app.use(cors());
// app.options('*', cors());
app.use(helmet());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(mongoSanitize());
app.use(xss());
app.use(compression());
app.use(bodyParser.json()); // to support JSON-encoded bodies  
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
// const limiter = rateLimit({
//   max: 1000,
//   windowMs: 60 * 60 * 1000,
//   message: 'Too many requests from this IP, please try again in an hour!'
// });
// app.use('/api', limiter);
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString;
  next();
});
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  console.log('-'+process.env.NODE_ENV+'-');
} else {
  console.log('-'+process.env.NODE_ENV.trim()+'-');
}

module.exports = app;