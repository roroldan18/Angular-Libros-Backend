import mongoose from 'mongoose';

//Creo un modelo de datos - de Generos 
const GeneroSchema = new mongoose.Schema({
    nombre: String
})

export const GeneroModel = mongoose.model("genero", GeneroSchema);
