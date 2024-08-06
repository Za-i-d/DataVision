const ruta = require("express").Router();
const BaseBD = require("../bd/BaseBD");
const AtributoTabla = require('../clases/TablaClase');

const baseBD = new BaseBD();

// Ruta para mostrar el inicio
ruta.get("/", async (req, res) => {
    try {
        const { conectado, latencia } = await baseBD.conectarMysql();
        const basesDeDatos = await baseBD.obtenerBaseDeDatos();
        res.render('inicio', { basesDeDatos, conectado, latencia });
    } catch (error) {
        console.error("Error al obtener bases de datos: " + error.message);
    }
});

// Ruta para mostrar la creacion de una base de datos
ruta.post('/', async(req, res) => {
    const { conectado, latencia } = await baseBD.conectarMysql();
    res.render('createBD', { conectado, latencia });
});


// Ruta para crear una base de datos
ruta.post("/crearBaseDeDatos", async (req, res) => {
    const { databaseName } = req.body;
    try {
        await baseBD.createDatabase(databaseName);
        res.redirect('/crearTabla');
    } catch (error) {
        res.status(400).send('Error al crear la base de datos: ' + error.message);
    }

});


// Ruta para eliminar una base de datos
ruta.post('/eliminarBaseDeDatos/:databaseName', async (req, res) => {
    const { databaseName } = req.params;
    try {
        await baseBD.eliminarBaseDeDatos(databaseName);
        res.redirect('/');
    } catch (error) {
        console.error('Error al eliminar la base de datos:', error.message);
        res.status(500).send('Error al eliminar la base de datos.');
    }
});

// Ruta para editar una base de datos
ruta.get('/editarBaseDeDatos/:databaseName', async(req, res) => {
    const { databaseName } = req.params;
    const { conectado, latencia } = await baseBD.conectarMysql();
    res.render('editarBD', { databaseName, conectado, latencia });
});

// Ruta para actualizar una base de datos
ruta.post('/actualizarBaseDeDatos/:databaseName', async (req, res) => {
    const { databaseName } = req.params;
    const { nuevoNombre } = req.body;
    try {
        await baseBD.actualizarBaseDeDatos(databaseName, nuevoNombre);
        res.redirect('/');
    } catch (error) {
        console.error('Error al actualizar la base de datos:', error.message);
        res.status(500).send('Error al actualizar la base de datos.');
    }
});

// Ruta para crear una tabla
ruta.post('/crearTabla', async (req, res) => {
    const { databaseName, tableName, attributes } = req.body;
    let attributesArray;
    try {
        // Si `attributes` es una cadena, intenta analizarla
        if (typeof attributes === 'string') {
            attributesArray = JSON.parse(attributes);
        } else {
            attributesArray = attributes;
        }
    } catch (error) {
        return res.status(400).send('Error en la conversión de atributos JSON: ' + error.message);
    }

    // Verifica que `nombreBaseDeDatos` y `tableName` sean válidos
    if (!databaseName || !tableName) {
        return res.status(400).send('Nombre de la base de datos o nombre de la tabla no proporcionados.');
    }

    try {
        // Construir la estructura de la tabla
        let tableStructure = attributesArray.map(attr => {
            let structure = `${attr.nombre} ${attr.tipo}`;
            if (attr.tipo === 'varchar') {
                structure += `(${attr.tamano})`;
            }
            structure += attr.unico ? ' UNIQUE' : '';
            structure += attr.noNulo ? ' NOT NULL' : '';
            structure += attr.llavePrimaria ? ' PRIMARY KEY' : '';
            structure += attr.llaveForanea ? ' FOREIGN KEY' : '';
            structure += attr.nulo ? ' NULL' : '';
            return structure;
        }).join(', ');
        await baseBD.createTable(databaseName, tableName, tableStructure);
        res.redirect('/');
    } catch (error) {
        res.status(400).send("Error al crear la tabla: " + error.message);
    }
});

ruta.get('/crearTabla', async (req, res) => {
    const { conectado, latencia } = await baseBD.conectarMysql();
    res.render('createTable', {conectado, latencia});
});


// Ruta para mostrar todas las tablas de una base de datos
ruta.get('/tablas/:databaseName', async (req, res) => {
    const databaseName = req.params.databaseName;
    try {
        const { conectado, latencia } = await baseBD.conectarMysql();
        const tableNames = await baseBD.obtenerTablas(databaseName);
        res.render('mostrarTablas', { databaseName, tableNames, conectado, latencia });
    } catch (error) {
        console.error("Error al obtener las tablas: " + error.message);
    }
});

// Ruta para editar una tabla
ruta.get('/editarTabla/:databaseName/:tableName', async (req, res) => {
    const { databaseName, tableName } = req.params;
    try {
        const { conectado, latencia } = await baseBD.conectarMysql();
        res.render('editarTabla', { databaseName, tableName, conectado, latencia });
    } catch (error) {
        console.error("Error al cargar el formulario de edición: " + error.message);
    }
});

// Ruta para agregar un aributo una tabla
ruta.post('/agregarColumna/:databaseName/:tableName', async (req, res) => {
    const { databaseName, tableName } = req.params;
    const { columnName, columnType, varcharSize, unique, notNull, foreign, nullable } = req.body;
    let columnDefinition = `${columnName} ${columnType}`;
    if (columnType === 'varchar' && varcharSize) {
        columnDefinition += `(${varcharSize})`;
    }
    if (unique) columnDefinition += ' UNIQUE';
    if (notNull) columnDefinition += ' NOT NULL';
    if (foreign) columnDefinition += ' FOREIGN KEY';
    if (nullable) columnDefinition += ' NULL';

    try {
        await baseBD.agregarColumna(databaseName, tableName, columnDefinition);
        res.redirect(`/editarTabla/${databaseName}/${tableName}`);
    } catch (error) {
        console.error("Error al agregar la columna: " + error.message);
    }
});

// Ruta para eliminar un atributo de la tabla
ruta.post('/eliminarColumna/:databaseName/:tableName', async (req, res) => {
    const { databaseName, tableName } = req.params;
    const { columnName } = req.body;
    if (columnName.toLowerCase() === 'id') {
        res.status(400).send("No se puede eliminar el campo primary key.");
        return;
    }
    try {
        await baseBD.eliminarColumna(databaseName, tableName, columnName);
        res.redirect(`/editarTabla/${databaseName}/${tableName}`);
    } catch (error) {
        console.error("Error al eliminar la columna: " + error.message);
        res.status(500).send("Error al eliminar la columna: " + error.message);
    }
});

// Ruta para modificar un atributo
ruta.post('/modificarColumna/:databaseName/:tableName', async (req, res) => {
    const { databaseName, tableName } = req.params;
    const { oldColumnName, newColumnName, newColumnType, newVarcharSize, newUnique, newNotNull, newForeign, newNullable } = req.body;
    let newColumnDefinition = `${newColumnName} ${newColumnType}`;
    if (newColumnType === 'varchar' && newVarcharSize) {
        newColumnDefinition += `(${newVarcharSize})`;
    }
    if (newUnique) newColumnDefinition += ' UNIQUE';
    if (newNotNull) newColumnDefinition += ' NOT NULL';
    if (newForeign) newColumnDefinition += ' FOREIGN KEY';
    if (newNullable) newColumnDefinition += ' NULL';

    try {
        await baseBD.modificarColumna(databaseName, tableName, oldColumnName, newColumnDefinition);
        res.redirect(`/editarTabla/${databaseName}/${tableName}`);
    } catch (error) {
        console.error("Error al modificar la columna: " + error.message);
        res.status(500).send("Error al modificar la columna: " + error.message);
    }
});

// Ruta para eliminar una tabla
ruta.get('/eliminarTabla/:databaseName/:tableName', async (req, res) => {
    const { databaseName, tableName } = req.params;
    try {
        await baseBD.eliminarTabla(databaseName, tableName);
        res.redirect(`/tablas/${databaseName}`);
    } catch (error) {
        console.error("Error al eliminar la tabla: " + error.message);
        res.status(500).send("Error al eliminar la tabla: " + error.message);
    }
});

// Ruta para mostrar todos los registros
ruta.get('/verRegistros/:databaseName/:tableName', async (req, res) => {
    const { databaseName, tableName } = req.params;
    try {
        const { conectado, latencia } = await baseBD.conectarMysql();
        const registros = await baseBD.obtenerRegistros(databaseName, tableName);
        const clavePrimaria = await baseBD.obtenerClavePrimaria(databaseName, tableName);
        res.render('verRegistros', { databaseName, tableName, registros, clavePrimaria, conectado, latencia });
    } catch (error) {
        console.error('Error al obtener los registros:', error.message);
        res.status(500).send('Error al obtener los registros.');
    }
});


// Ruta para mostrar el formulario de inserción de registros
ruta.get('/insertarRegistro/:databaseName/:tableName', async (req, res) => {
    const { databaseName, tableName } = req.params;
    try {
        const { conectado, latencia } = await baseBD.conectarMysql();
        const campos = await baseBD.obtenerCampos(databaseName, tableName);
        res.render('insertarRegistro', { databaseName, tableName, campos, conectado, latencia });
    } catch (error) {
        console.error("Error al obtener los campos de la tabla: " + error.message);
    }
});

// Ruta para manejar la inserción de registros
ruta.post('/insertarRegistro/:databaseName/:tableName', async (req, res) => {
    const { databaseName, tableName } = req.params;
    const datosRegistro = req.body;
    try {
        await baseBD.insertarRegistro(databaseName, tableName, datosRegistro);
        res.redirect(`/tablas/${databaseName}`);
    } catch (error) {
        console.error("Error al insertar el registro: " + error.message);
    }
});


// Ruta para mostrar el formulario de edición de un registro
ruta.get('/editarRegistro/:databaseName/:tableName/:Id', async (req, res) => {
    const { databaseName, tableName, Id } = req.params;
    const baseBD = new BaseBD();

    try {
        const { conectado, latencia } = await baseBD.conectarMysql();
        // Obtén el registro por ID
        const clavePrimaria = await baseBD.obtenerClavePrimaria(databaseName, tableName);
        const registro = await baseBD.obtenerRegistroPorId(databaseName, tableName, clavePrimaria, Id);
        res.render('editarRegistro', {
            databaseName,
            tableName,
            registro,
            clavePrimaria,
            conectado,
            latencia
        });
    } catch (error) {
        console.error('Error al obtener el registro:', error.message);
    }
});



// Ruta para actualizar el registro en la base de datos
ruta.post('/actualizarRegistro/:databaseName/:tableName/:Id', async (req, res) => {
    const { databaseName, tableName, Id } = req.params;
    const datosActualizados = req.body;
    console.log('Datos actualizados recibidos:', datosActualizados);
    try {
        await baseBD.actualizarRegistro(databaseName, tableName, Id, datosActualizados);
        res.redirect(`/verRegistros/${databaseName}/${tableName}`);
    } catch (error) {
        console.error('Error al actualizar el registro:', error.message);
        res.status(500).send('Error al actualizar el registro.');
    }
});


// Ruta para eliminar un registro específico
ruta.post('/eliminarRegistro/:databaseName/:tableName/:id', async (req, res) => {
    const { databaseName, tableName, id } = req.params;
    try {
        await baseBD.eliminarRegistro(databaseName, tableName, id);
        res.redirect(`/verRegistros/${databaseName}/${tableName}`);
    } catch (error) {
        console.error('Error al eliminar el registro:', error.message);
        res.status(500).send('Error al eliminar el registro.');
    }
});


module.exports = ruta;



/* TE AMO*/