import { Router } from 'express';
import { GeneroModel } from '../model/genero.model.js';
import { LibroModel } from '../model/libro.nodel.js';
import { PersonaModel } from '../model/persona.model.js';

export const librosRoutes = Router();



//-----------------API LIBROS-----------------------

//-----------------BUSQUEDA DE LIBROS-----------------------

librosRoutes.get('/libro', async (req, res) => {
    try{
        const libros = await LibroModel.find();
        res.status(200).send(libros);
    }
    catch(error) {
        console.log(error);
    }
})

//-----------------BUSQUEDA DE LIBROS POR ID-----------------------

librosRoutes.get('/libro/:id', async (req, res) => {
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

librosRoutes.get('/libro/searchPerson/:personaID', async (req, res) => {
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

librosRoutes.get('/libro/searchGenre/:generoID', async (req, res) => {
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

librosRoutes.get('/libro/searchName/:nombre', async (req, res) => {
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

librosRoutes.post('/libro', async (req, res) => {
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


librosRoutes.delete('/libro/:id', async (req, res) => {
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
librosRoutes.put('/libro/:id', async (req, res)=> {
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

librosRoutes.put('/libro/prestar/:id', async (req, res)=> {
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

librosRoutes.put('/libro/devolver/:id', async (req, res)=> {
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

