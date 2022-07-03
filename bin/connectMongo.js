
import mongoose from 'mongoose';
import { uri } from '../config.js';

//Agrego la funcion para conectarme con el MONGO.
export const conectar = async () => {
    try{
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        console.log("Conectado a la base de datos metodo: mongoodb - async-await");
    }
    catch(e){
        console.log(e);
    }
};

