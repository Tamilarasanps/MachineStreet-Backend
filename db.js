const mongoose = require('mongoose');
require('dotenv').config();
const gridfsStream = require('gridfs-stream')

const connect = async () => {
    const uri = process.env.MONGO_URI;
    try {
        const conn = await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("MongoDB connected successfully!"); 

        const gfs = gridfsStream(conn.connection.db,mongoose.mongo)
        gfs.collection('uploads')
    } catch (err) {
        console.error("MongoDB connection error:", err);
        process.exit(1); // Exit process on failure
    }
};

module.exports = connect;
