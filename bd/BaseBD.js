// aqui va toda la sintaxis del SQL
const { log } = require("console");
const ConectarBD=require("./ConectarBD");

class BaseBD extends ConectarBD{
    constructor(){
        super();
    }
   // Método para obtener las base de datos
    async obtenerBaseDeDatos(){
        await this.conectarMysql();
        try{
            const [rows]= await this.conexion.query("SHOW DATABASES");
            return rows;  // Aquí estamos devolviendo los resultados de la consulta
        }catch (error) {
         console.error("Error al obtener base de datos:"+error.message);
         throw error;
        } finally{
            await this.cerrarConexion();
        }
    }

    // Método para crear una base de datos
    async createDatabase(databaseName) {
        try {
            await this.conectarMysql();
            await this.conexion.query(`CREATE DATABASE \`${databaseName}\``); // Uso de backticks para nombres de bases de datos
            console.log(`Base de datos ${databaseName} creada`);
        } catch (error) {
            console.error('Error al crear la base de datos: ' + error.message);
        } finally {
            await this.cerrarConexion();
        }
    }

        // Método para eliminar una base de datos
        async eliminarBaseDeDatos(databaseName) {
            try {
                await this.conectarMysql();
                await this.conexion.query(`DROP DATABASE \`${databaseName}\``);
            } finally {
                await this.conexion.end();
            }
        }
    

        // Método para actualizar el nombre de una base de datos (este lo hice asi porque con rename no se actualizaba el nombre)
        async actualizarBaseDeDatos(databaseName, nuevoNombre) {
            try {
                 await this.conectarMysql();
                // Crear nueva base de datos
                await this.conexion.query(`CREATE DATABASE \`${nuevoNombre}\``); 
    // Copiar tablas de la base de datos antigua a la nueva
                const [tablas] = await this.conexion.query(`SHOW TABLES FROM \`${databaseName}\``);
                for (let tabla of tablas) {
                    const tablaNombre = tabla[`Tables_in_${databaseName}`];
                    await this.conexion.query(`CREATE TABLE \`${nuevoNombre}\`.\`${tablaNombre}\` LIKE \`${databaseName}\`.\`${tablaNombre}\``);
                    await this.conexion.query(`INSERT INTO \`${nuevoNombre}\`.\`${tablaNombre}\` SELECT * FROM \`${databaseName}\`.\`${tablaNombre}\``);
                }
                // Eliminar la base de datos antigua
                await this.conexion.query(`DROP DATABASE \`${databaseName}\``);
            } finally {
                await this.conexion.end();
            }
        }
    
    // Método para crear tabla
    async createTable(databaseName, tableName, tableStructure) {
        try {
            await this.conectarMysql();
            console.log(tableStructure);
            await this.conexion.query(`USE \`${databaseName}\``);
            const createTableQuery = `CREATE TABLE IF NOT EXISTS \`${tableName}\` (${tableStructure})`;
            await this.conexion.query(createTableQuery);
            console.log(`Tabla ${tableName} creada en la base de datos ${databaseName}`);
        } catch (error) {
            console.error('Error al crear la tabla: ' + error.message);
            throw error;
        } finally {
            await this.cerrarConexion();
        }
    }

    // Método para obtener tablas
    async obtenerTablas(databaseName) {
        try {
            await this.conectarMysql();
            await this.conexion.query(`USE \`${databaseName}\``);
            const [rows] = await this.conexion.query('SHOW TABLES');
            return rows.map(row => Object.values(row)[0]); // Extraer nombres de las tablas
        } finally {
            await this.conexion.end();
        }
    }

    
    // Método para agregar una columna
    async agregarColumna(databaseName, tableName, columnDefinition) {
        try {
            await this.conectarMysql();
            await this.conexion.query(`USE \`${databaseName}\``);
            const addColumnQuery = `ALTER TABLE \`${tableName}\` ADD COLUMN ${columnDefinition}`;
            await this.conexion.query(addColumnQuery);
            console.log(`Columna ${columnDefinition} agregada a la tabla ${tableName}`);
        } finally {
            await this.conexion.end();
        }
    }

    // Método para eliminar una columna
    async eliminarColumna(databaseName, tableName, columnName) {
        try {
            await this.conectarMysql();
            await this.conexion.query(`USE \`${databaseName}\``);
            const dropColumnQuery = `ALTER TABLE \`${tableName}\` DROP COLUMN \`${columnName}\``;
            await this.conexion.query(dropColumnQuery);
            console.log(`Columna ${columnName} eliminada de la tabla ${tableName}`);
        } finally {
            await this.conexion.end();
        }
    }

    // Método para modificar una columna
    async modificarColumna(databaseName, tableName, oldColumnName, newColumnDefinition) {
        try {
            await this.conectarMysql();
            await this.conexion.query(`USE \`${databaseName}\``);
            const modifyColumnQuery = `ALTER TABLE \`${tableName}\` CHANGE \`${oldColumnName}\` ${newColumnDefinition}`;
            await this.conexion.query(modifyColumnQuery);
            console.log(`Columna ${oldColumnName} modificada a ${newColumnDefinition} en la tabla ${tableName}`);
        } finally {
            await this.conexion.end();
        }
    }
 
    // Método para eliminar una tabla
    async eliminarTabla(databaseName, tableName) {
        try {
            await this.conectarMysql();
            await this.conexion.query(`USE \`${databaseName}\``);
            await this.conexion.query(`DROP TABLE \`${tableName}\``);
            console.log(`Tabla ${tableName} eliminada de la base de datos ${databaseName}`);
        } finally {
            await this.conexion.end();
        }
    }

    // Método para obtener registros
    async obtenerRegistros(databaseName, tableName) {
        try {
            await this.conectarMysql();
            const [rows] = await this.conexion.query(`SELECT * FROM \`${databaseName}\`.\`${tableName}\``);
            return rows;
        } finally {
            await this.conexion.end();
        }
    }
    
    // Método para obtener los campos
       async obtenerCampos(databaseName, tableName) {
            
            try {
                await this.conectarMysql();
                await this.conexion.query(`USE \`${databaseName}\``);
                const [rows] = await this.conexion.query(`DESCRIBE \`${tableName}\``);
                return rows;
            } finally {
                await this.conexion.end();
            }
        }

        // Método para insertar un registro
        async insertarRegistro(databaseName, tableName, datosRegistro) {
            try {
                await this.conectarMysql();
                await this.conexion.query(`USE \`${databaseName}\``);
                const campos = Object.keys(datosRegistro).map(key => `\`${key}\``).join(', ');
                const valores = Object.values(datosRegistro).map(value => `'${value}'`).join(', ');
                const insertQuery = `INSERT INTO \`${tableName}\` (${campos}) VALUES (${valores})`;
                await this.conexion.query(insertQuery);
                console.log(`Registro insertado en la tabla ${tableName} de la base de datos ${databaseName}`);
            } finally {
                await this.conexion.end();
            }
        }

        // Método para obtener un registro por Id
        async obtenerRegistroPorId(databaseName, tableName, clavePrimaria,Id) {
            try {
                await this.conectarMysql();
                await this.conexion.query(`USE \`${databaseName}\``);
                const [rows] = await this.conexion.query(`SELECT * FROM \`${tableName}\` WHERE \`${clavePrimaria}\` = ?`, [Id]);
                return rows[0]; // Devuelve el primer registro encontrado
            } catch (error) {
                console.error('Error al obtener el registro:', error);
                throw error;
            } finally {
                    await this.conexion.end();
            }
        }
    
        // Método para actualizar un registro específico
        async actualizarRegistro(databaseName, tableName, id, datosActualizados) {
            try {
                await this.conectarMysql();
                await this.conexion.query(`USE \`${databaseName}\``);
                const setClause = Object.keys(datosActualizados)
                    .filter(key => key !== 'id')
                    .map(key => `\`${key}\` = ?`)
                    .join(', ');
                const valores = Object.values(datosActualizados).filter((_, index) => index !== 'id');
                valores.push(id);
                await this.conexion.query(`UPDATE \`${tableName}\` SET ${setClause} WHERE id = ?`, valores);
            } finally {
                await this.conexion.end();
            }
        }

        // Método para eliminar un registro específico
    async eliminarRegistro(databaseName, tableName, id) {
        try {
            await this.conectarMysql();
            await this.conexion.query(`USE \`${databaseName}\``);
            await this.conexion.query(`DELETE FROM \`${tableName}\` WHERE id = ?`, [id]);
        } finally {
            await this.conexion.end();
        }
    }

    async obtenerClavePrimaria(databaseName, tableName) {
        try {
            await this.conectarMysql();
            await this.conexion.query(`USE \`${databaseName}\``);
            const [rows] = await this.conexion.query(`
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = ? 
                AND TABLE_NAME = ? 
                AND COLUMN_KEY = 'PRI'`, [databaseName, tableName]);
            return rows[0] ? rows[0].COLUMN_NAME : null;
        } finally {
            await this.conexion.end();
        }
    }
    
    }
    


    


module.exports=BaseBD;
