import mongoose from 'mongoose';

//Creo Schema de libro
const LibroSchema = new mongoose.Schema({
    nombre: String,
    genero: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'genero'
    },
    descripcion: String,
    persona: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'persona'
    }
})

export const LibroModel = mongoose.model("libro", LibroSchema);
