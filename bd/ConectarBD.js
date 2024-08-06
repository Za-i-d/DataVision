require('dotenv').config();
const mysql = require("mysql2/promise");

class ConectarBD {
    constructor() {
        this.conexion = null;
        //this.mysql=require("mysql2/promise");
    }

    async conectarMysql() {
        try {
            const start = Date.now();
            this.conexion = await mysql.createConnection({
                host:process.env.HOST,
                user:process.env.USER,
                password:process.env.PASSWORD,
                port:process.env.PORTBD,
                socketPath: '/Applications/MAMP/tmp/mysql/mysql.sock'
            });
            const end = Date.now();
            const latencia = end - start;
            console.log("Conectado a MySql")
            return { conectado : true, latencia : latencia};
        } catch (error) {
            console.error("Error al conectar con MySql " + error.message);
            return { conectado : false, latencia : null};
        }

    }

    async cerrarConexion() {
        try {
            if (this.conexion) {
                await this.conexion.end();
                console.log("Conexión a MySQL cerrada");
            }
        } catch (error) {
            console.log("Error al desconectar Mysql " + error.message);
        }
    }
}

module.exports = ConectarBD;