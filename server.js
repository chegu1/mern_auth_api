const express = require('express');
const app = express();
require('dotenv').config()
const port = process.env.PORT || 5000;
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors')
require('./utils/db')
/*
routes
*/
const authRoute = require('./app/routes/auth')
const userRoute = require('./app/routes/user');


/*
load middlewares
*/
app.use(express.json())
app.use(bodyParser.json())
app.use(morgan('dev'))
if (process.env.NODE_ENV = 'development') {
    app.use(cors({ origin: `http://localhost:3000` }))
}
app.use('/api', authRoute);
app.use('/api', userRoute);



app.listen(port, (err) => {
    if (err) return console.log(`${err}`)
    console.log(`server successfully connected on ${port}`)
})