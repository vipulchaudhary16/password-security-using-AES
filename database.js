const mongoose = require("mongoose");

//configuting the dotenv
const dotenv = require('dotenv');
dotenv.config();

// const mongoURI = process.env.MONGO_URI;
const mongoURI = 'mongodb://localhost:27017/infosec'

const connectToMongo = async () => {
  mongoose.connect(
    mongoURI,
    { useNewUrlParser: true, useUnifiedTopology: true },
    () => {
      console.log("Connected to mongo");
    }
  );
};

module.exports = connectToMongo;
