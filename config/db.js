
const mongoose = require('mongoose');

const connectWithDb = () => {
        mongoose.connect(process.env.DB_URL, {
                useNewUrlparser:true,
                useUnifiedTopology:true,
        })
        .then((data) => {
                console.log(`---------- DB CONNECTED ----------`);
        })
        .catch(err => {
                console.log(`DB CONNECTION ISSUE`);
                console.log(err);
                process.exit(1);
        })
};

module.exports = connectWithDb;