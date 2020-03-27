const express = require('express');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const dotenv = require('dotenv');
const morgan = require('morgan');
const connectToDB = require('./config/db');
const authRoute = require('./routes/authRoute');
const itemRoute = require('./routes/itemRoute');

dotenv.config({path: './config/config.env'});
connectToDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cors());
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.SECRET_KEY,
    cookie: {secure: true}
}));
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname,'public')));
app.use('/api/auth',authRoute);
app.use('/api/items',itemRoute);

const port = process.env.PORT || 5000;

app.get('*',(req,res) => {
    res.send('./client/build/index.html');
});

app.listen(port, () => console.log(`server is running in ${process.env.NODE_ENV} mode on port ${port}`));