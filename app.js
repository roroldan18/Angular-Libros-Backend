const express = require('express');
/* Creo los dos Require para usar MONGO */
const mongodb = require('mongodb');
const mongoose = require ('mongoose');

const cors = require('cors');

const app = express();

//TERNARIO (Un if de solo una linea)
const port = process.env.PORT?process.env.PORT:3000;

app.use(express.json()); //Linea MUY importante para poder mandar info por metodo POST y que lo interprete como JSON (y lo pase al req.body)
app.use(cors());

/* Ahora agrego la función para usar el Mongo con el texto que teníamos del codigo*/
/* mongodb+srv://roroldan:<password>@cluster0.08rce.mongodb.net/<dbname>?retryWrites=true&w=majority */
const uri = "mongodb+srv://roroldan:132465Rodry@cluster0.08rce.mongodb.net/mislibros?retryWrites=true&w=majority";


//Agrego la funcion para conectarme con el MONGO.
async function conectar() {
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

conectar();

//Configuracion de la base de datos. Mongoose es un ORM
//schemas y models

//Creo un modelo de datos - de Generos 

const GeneroSchema = new mongoose.Schema({
    nombre: String
})
const GeneroModel = mongoose.model("genero", GeneroSchema);

//Creo Persona

const PersonaSchema = new mongoose.Schema({ 
    nombre: String,
    apellido: String,
    alias: String,
    email: String,
    celu: String
})

const PersonaModel = mongoose.model("persona", PersonaSchema);

//Creo libro

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

const LibroModel = mongoose.model("libro", LibroSchema);


// ------------------------ GENERO ---------------------------

//------------- LISTAR TODOS LOS GENEROS ----------------------

app.get('/genero', async (req, res) => {
    try{
        const generos = await GeneroModel.find();
        console.log(generos);
        res.status(200).send(generos);
    }
    catch(error) {
        console.log(error);
    }
})

//------------- LISTAR POR ID ----------------------

app.get('/genero/:id', async (req, res) => {
    try{

        //Valido si el genero existe
        const unGenero = await RecetasModel.findById(req.params.id);

        if (unGenero == undefined || !unGenero){
            res.status(404).send('No existe un genero con ese ID');
        }

        res.status(200).send(unGenero);
    }
    catch(error) {
        console.log(error);
        res.status(404).send('No existe el genero');
    }
})

//------------- ALTA NUEVO GENERO ----------------------

app.post('/genero', async (req, res) => {
    try{

        //Reviso si me mando los datos
        if(!req.body.nombre){
            throw new Error('Falta el genero a dar de alta');
        }

        //Reviso si el genero ya existe
        const generoExiste = await GeneroModel.findOne({nombre: req.body.nombre});

        if (generoExiste){
            res.status(404).send('El genero que intentas dar de alta ya existe.');
            return;
        }

        // Para Mongo DB debo mandarle siempre un JSON
        const genero = {
            nombre : req.body.nombre
        };

        const newGenero = await GeneroModel.create(genero);

        res.status(200).send('Se agregó el genero ' + newGenero);
    }

    catch(error) {
        console.log(error);
    }
})

//------------- ELIMINO  GENERO ----------------------

app.delete('/genero/:id', async (req, res) => {
    try{
        //Valido si el genero existe
        const unGenero = await GeneroModel.findById(req.params.id);
        if (unGenero == undefined || !unGenero){
            res.status(413).send('No existe un genero con ese ID');
            return;
        };

        //Valido que el genero no esté usado en un libro
        const elGenero = await LibroModel.findOne({genero: req.params.id})
        if (elGenero){
            res.status(413).send('No podes eliminar un genero que está siendo usado en un libro');
            return;
        }

        await GeneroModel.findByIdAndDelete(req.params.id);

        res.status(200).send('Se borró satisfactoriamente')
    }
    catch {
        console.log(error);
    }
})

//------------- MODIFICACION DE GENERO ----------------------

app.put('/genero/:id', async (req, res) => {
    try{
        //Valido si el genero existe
        const unGenero = await GeneroModel.findById(req.params.id);
        if(unGenero == undefined || !unGenero){
            throw new Error('No existe un genero con ese ID');
        }

        if(!req.body.nombre){
            throw new Error('No enviaste el genero');
        }

        /* Toda esta linea de codigo es para cambiar el Nombre del genero y actualizarlo. */
        const generoCambiado = await GeneroModel.findByIdAndUpdate(req.params.id, {nombre: req.body.nombre}, {new: true});


        res.status(200).send('Se modificó satisfactoriamente al genero: ' + req.body.nombre);
    }
    catch {
        console.log(error);
    }
})


//-----------------API PERSONAS-----------------------

//-----------------LISTO TODAS LAS PERSONAS-----------------------

app.get('/persona', async (req, res) => {
    try{
        let personas = await PersonaModel.find();
        res.status(200).send(personas);
    }
    catch {
        console.log(error);
    }
})


//-----------------BUSCO UNA PERSONA POR ID-----------------------

app.get('/persona/:id', async(req, res) => {
    try {
        const unaPersona = await PersonaModel.findById(req.params.id);

        if (unaPersona == undefined || !unaPersona){
        res.status(404).send('No existe una persona con ese ID');
        return; }

        res.status(200).send(unaPersona);

    }
    catch(error) {
    console.log(error);
    }
})

//-----------------BUSCO UNA PERSONA POR NOMBRE-----------------------

app.get('/persona/search/:nombre', async(req, res) => {
    try {
        const unaPersona = await PersonaModel.find({nombre: req.params.nombre});

        if (unaPersona == undefined || !unaPersona || unaPersona.length == 0){
        res.status(404).send('No existe una persona con ese nombre');
        return; }

        res.status(200).send(unaPersona);

    }
    catch(error) {
    console.log(error);
    }
})


//----------------- ALTA DE PERSONA -----------------------

app.post('/persona', async (req, res) => {
    try{

        if(!req.body.nombre || !req.body.apellido || !req.body.alias || !req.body.email || !req.body.celu){
            throw new Error('No me enviaste todos los datos de la persona');
        }   

        const mailExiste = await PersonaModel.findOne({email: req.body.email});

        if (mailExiste){
            res.status(413).send('Ya existe una persona con ese email');
            return;
        }


        const personaNueva = {
            nombre: req.body.nombre,
            apellido: req.body.apellido,
            alias: req.body.alias,
            email: req.body.email,
            celu: req.body.celu
        };

        const newPersona = await PersonaModel.create(personaNueva);

        res.status(200).send('Se dio de alta a la persona: ' + personaNueva.nombre + ' ' + personaNueva.apellido);
    }
    catch(error){
        console.log(error);
    }
})

//----------------- BORRO UNA PERSONA -----------------------

app.delete('/persona/:id', async (req, res) => {
    try{
        
        //Valido que la persona exista
        const persona = await PersonaModel.findById(req.params.id);

        if (persona == undefined || !persona){
        res.status(404).send('No existe una persona con ese ID');
        return; }

        //Valido que la persona no tenga un libro
        const unaPersona = await LibroModel.findOne({persona: req.params.id})
        if (unaPersona){
            res.status(413).send('No podes eliminar una persona que tiene un libro');
            return;
        }
        
        await PersonaModel.findByIdAndDelete(req.params.id);

        res.status(200).send('Se borró satisfactoriamente la persona: ' + persona);
    }
    catch(error){
        console.log(error);
    }
})

//----------------- MODIFICAR UNA PERSONA  - SOLO CELULAR -----------------------

app.put('/persona/:id', async (req, res) => {
    try{
        //Valido si la persona existe
        const unaPersona = await PersonaModel.findById(req.params.id);

        if(unaPersona == undefined || !unaPersona){
            throw new Error('No existe la persona');
        };

        if(!req.body.celu){
            throw new Error('No enviaste el celular a cambiar');
        };
        
        const personaCambiada = await PersonaModel.findByIdAndUpdate(req.params.id,{celu: req.body.celu} ,{new: true});

        res.status(200).send('Se modificó con exito el celular!');
    }
    catch(error) {
        console.log(error);
    }
})



//-----------------API LIBROS-----------------------


//-----------------BUSQUEDA DE LIBROS-----------------------

app.get('/libro', async (req, res) => {
    try{
        const libros = await LibroModel.find();
        res.status(200).send(libros);
    }
    catch(error) {
        console.log(error);
    }
})

//-----------------BUSQUEDA DE LIBROS POR ID-----------------------

app.get('/libro/:id', async (req, res) => {
    try{

        const unLibro = await LibroModel.findById(req.params.id);

        if (unLibro == undefined || !unLibro){
            res.status(404).send('No hay un libro con ese ID');
        };

        res.status(200).send(unLibro);
    }
    catch(error) {
        console.log(error);
    }
})

//-----------------BUSQUEDA DE LIBROS POR PERSONA QUE LO TIENE-----------------------

app.get('/libro/searchPerson/:personaID', async (req, res) => {
    try{
        const libros = await LibroModel.find({persona: req.params.personaID});
        const personaExiste = await PersonaModel.findOne({_id: req.params.personaID});

        if (!personaExiste){
            res.status(404).send('No existe la persona enviada, primero tiene que darla de alta');
            return;
        }

        if (libros == undefined || !libros || libros.length == 0){
            res.status(404).send('La persona no ningun libro');
            return;
        };

        res.status(200).send(libros);
    }
    catch(error) {
        console.log(error.stack);
    }
})

//-----------------BUSQUEDA DE LIBROS POR GENERO-----------------------

app.get('/libro/searchGenre/:generoID', async (req, res) => {
    try{
        const libros = await LibroModel.find({genero: req.params.generoID});
        const generoExiste = await GeneroModel.findOne({_id: req.params.generoID});

        if (!generoExiste){
            res.status(404).send('No existe el genero enviado, primero tenes que darlo de alta');
            return;
        }

        if (libros == undefined || !libros || libros.length == 0){
            res.status(404).send('No hay ningun libro dado de alta con ese genero');
            return;
        };

        res.status(200).send(libros);
    }
    catch(error) {
        console.log(error);
    }
})

//-----------------BUSQUEDA DE LIBROS POR NOMBRE-----------------------

app.get('/libro/searchName/:nombre', async (req, res) => {
    try{
        const libro = await LibroModel.find({nombre: req.params.nombre});

        if (libro == undefined || !libro || libro.length == 0){
            res.status(404).send('No existe un libro con ese nombre');
            return;
        };

        res.status(200).send(libro);
    }
    catch(error) {
        console.log(error);
    }
})


//-----------------ALTA DE UN LIBRO-----------------------

app.post('/libro', async (req, res) => {
    try{

        const unLibro = {
            nombre: req.body.nombre,
            descripcion: req.body.descripcion,
            persona: req.body.persona,
            genero: req.body.genero
        }

        if(!req.body.nombre || !req.body.genero || !req.body.descripcion){
            res.status(413).send('No enviaste todos los datos para el alta');
            return;
        }

        if (req.body.persona){
            const personaExiste = await PersonaModel.findOne({_id: req.body.persona});
            if(!personaExiste){
                res.status(413).send('No existe la persona enviado, tenes que darla de alta');
                return;
            } 
        }

        const generoExiste = await GeneroModel.findOne({_id: req.body.genero});
        const libroExiste = await LibroModel.findOne({nombre: req.body.nombre});
    
        if (!generoExiste){
            res.status(413).send('No existe el genero enviado');
            return;
        }
    
        if (libroExiste){
            res.status(413).send('El libro "' + req.body.nombre + '" ya está dado de alta');
            return;
        }

        if(!req.body.persona){
            unLibro.persona = null;
        }

        const newLibro = await LibroModel.create(unLibro);

        res.status(200).send('Se agregó el Libro' + newLibro);
    }
    catch(error) {
        console.log(error);
    }
})


app.delete('/libro/:id', async (req, res) => {
    try{
        const libroExiste = await LibroModel.findById(req.params.id);

        if(!libroExiste){
            res.status(413).send('No existe un libro con ese ID');
            return;
        };
        
        await LibroModel.findByIdAndDelete(req.params.id);

        res.status(200).send('Se borró correctamente')
    }
    catch(error) {
        console.log(error);
    }
})

//Modifico solo la descripción del libro
app.put('/libro/:id', async (req, res)=> {
    try {
        const libroExiste = await LibroModel.findById(req.params.id);

        if(!libroExiste){
            res.status(413).send('No existe un libro con ese ID');
            return;
        };

        if(!req.body.descripcion){
            throw new Error("No mandaste los datos necesarios para la modificación");
        }

        const libroCambiado = await LibroModel.findByIdAndUpdate(req.params.id, {descripcion: req.body.descripcion}, {new: true});

        res.status(200).send(libroCambiado);
    }
    catch(e) {
        console.log(e);
        res.status(413).send({error: "Hubo un error, intentá nuevamente"});
    }
});

//Prestar un libro (hago un PUT de la persona en principio);

app.put('/libro/prestar/:id', async (req, res)=> {
    try {
        const libroExiste = await LibroModel.findById(req.params.id);
        const personaExiste = await PersonaModel.findOne({_id: req.body.persona});

        if(!libroExiste){
            res.status(413).send('No existe un libro con ese ID');
            return;
        };

        if(libroExiste.persona != null){
            res.status(413).send('Este libro ya está prestado, tenes que devolverlo primero');
            return;
        }

        if(!req.body.persona){
            res.status(413).send('No enviaste el dato de la persona');
            return;
        }

        if (!personaExiste){
            res.status(413).send('No existe la persona enviada, primero hay que darla de alta');
            return;
        }

        const libroCambiado = await LibroModel.findByIdAndUpdate(req.params.id, {persona: req.body.persona}, {new: true});

        res.status(200).send(libroCambiado);
    }
    catch(e) {
        console.log(e);
        res.status(413).send({error: "Hubo un error, intentá nuevamente"});
    }
});

//Devolver un libro (hago un PUT de la persona en vacio en principio);

app.put('/libro/devolver/:id', async (req, res)=> {
    try {
        const libroExiste = await LibroModel.findById(req.params.id);

        if(!libroExiste){
            res.status(413).send('No existe un libro con ese ID');
            return;
        };

        if(libroExiste.persona == null){
            res.status(413).send('No se puede devolver. El libro no está prestado.');
            return;
        }

        const libroCambiado = await LibroModel.findByIdAndUpdate(req.params.id, {persona: null}, {new: true});

        res.status(200).send(libroCambiado);
    }
    catch(e) {
        console.log(e);
        res.status(413).send({error: "Hubo un error, intentá nuevamente"});
    }
});
















//Creamos la variable PORT para definir el puerto que me de el ENTORNO
app.listen(port, () => {
    console.log('Servidor escuchando en el puerto' + port);
});