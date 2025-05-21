const mongoose = require("mongoose");
const color = require("colors");

const connectDB = async() => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URL);
        console.log(
            `Database Connected Successfully with ${conn.connection.host}.`.bgGreen
            .white
        );
    } catch (error) {
        console.log(`Error in DataBase, ${error}`.bgRed.white);
    }
};

module.exports = connectDB;