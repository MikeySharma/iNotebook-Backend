const mongoose = require('mongoose');
const mongoURI = `mongodb://127.0.0.1:27017/inotebook`;

const connectToMongo = () =>{
    try {
        mongoose.connect(mongoURI);
    } catch(error){
        console.log(error)
    }
    console.log('Connected to Mongoose Successfully')
    
}
module.exports = connectToMongo;