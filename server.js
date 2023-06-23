// init source expressjs
const express = require('express');
const app = express();
const port = 3000;
const fileUpload = require('express-fileupload');


const routes = require('./route/index');
const flash = require('connect-flash');
app.use(flash());
const session = require('express-session');

app.use(session({
    secret: 'loctesse',
    resave: false,
    saveUninitialized: false
}));

app.set('view engine', 'ejs');
app.use(express.static('views'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());
app.use('/', routes);

app.listen(port, () => {
    console.log(`Server started on port`);
});