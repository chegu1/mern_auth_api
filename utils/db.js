const mongoose = require('mongoose');

const dbConnection = mongoose.connect(
    process.env.DATABASE,
    {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false
    })
    .then(res => console.log("db connected successfully"))
    .catch(err => console.log(`db connection failed ${err}`))

module.exports = dbConnection;