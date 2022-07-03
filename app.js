import express, { json } from 'express';
import cors from 'cors';

import { conectar } from './bin/connectMongo.js';
import { librosRoutes } from './API/libros.api.js'
import { generosRoutes } from './API/generos.api.js'
import { personasRoutes } from './API/personas.api.js'

const app = express();
const port = process.env.PORT?process.env.PORT:3000;

app.use(json()); //Linea MUY importante para poder mandar info por metodo POST y que lo interprete como JSON (y lo pase al req.body)
app.use(cors());

app.use(generosRoutes);
app.use(librosRoutes);
app.use(personasRoutes);

//Traigo mi función CONECTAR de la conexión de mongo
conectar();

//Creamos la variable PORT para definir el puerto que me de el ENTORNO
app.listen(port, () => {
    console.log('Servidor escuchando en el puerto' + port);
});