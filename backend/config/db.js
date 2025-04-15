const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        });

        console.log(`MongoDB conectado: ${conn.connection.host}`);
    } catch (err) {
        console.error(`Erro ao conectar ao MongoDB: ${err.message}`);
        process.exit(1);
    }
};

module.exports = connectDB; 