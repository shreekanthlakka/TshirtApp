const app = require('./app');
const connectWithDb = require('./config/db');
require('dotenv').config();

const cloudinary = require('cloudinary');

connectWithDb();

cloudinary.config({
        cloud_name:process.env.CLODINARY_NAME,
        api_key:process.env.CLOUDINARY_API_KEY,
        api_secret:process.env.CLOUDINARY_API_SECRET,

});

app.listen(process.env.PORT, () => {
        console.log(`server is up and running at port :${process.env.PORT}`);
})