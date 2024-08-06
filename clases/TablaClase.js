//aqui se validan los datos de las tablas como nombre, atributos etc
class AtributoTabla {
    constructor({ nombre, tipo, tamano, unico, noNulo, llavePrimaria, llaveForanea, nulo }) {
        this.nombre = nombre;
        this.tipo = tipo;
        this.tamano = tamano;
        this.unico = unico;
        this.noNulo = noNulo;
        this.llavePrimaria = llavePrimaria;
        this.llaveForanea = llaveForanea;
        this.nulo = nulo;
    }

    set nombre(nombre) {
        if (typeof nombre === 'string' && nombre.trim().length > 0) {
            this._nombre = nombre.trim();
        } else {
            throw new Error('Nombre del atributo inválido');
        }
    }

    set tipo(tipo) {
        const tiposValidos = ['int', 'varchar', 'double'];
        if (tiposValidos.includes(tipo)) {
            this._tipo = tipo;
        } else {
            throw new Error('Tipo del atributo inválido');
        }
    }

    set tamano(tamano) {
        if (this._tipo === 'varchar') {
            if (typeof tamano !== 'number' || tamano <= 0) {
                throw new Error('Tamaño de varchar inválido');
            }
            this._tamano = tamano;
        } else {
            this._tamano = undefined; // El tamaño solo se aplica a varchar
        }
    }

    set unico(unico) {
        this._unico = Boolean(unico);
    }

    set noNulo(noNulo) {
        this._noNulo = Boolean(noNulo);
    }

    set llavePrimaria(llavePrimaria) {
        this._llavePrimaria = Boolean(llavePrimaria);
    }

    set llaveForanea(llaveForanea) {
        this._llaveForanea = Boolean(llaveForanea);
    }

    set nulo(nulo) {
        this._nulo = Boolean(nulo);
    }

    get nombre() {
        return this._nombre;
    }

    get tipo() {
        return this._tipo;
    }

    get tamano() {
        return this._tamano;
    }

    get unico() {
        return this._unico;
    }

    get noNulo() {
        return this._noNulo;
    }

    get llavePrimaria() {
        return this._llavePrimaria;
    }

    get llaveForanea() {
        return this._llaveForanea;
    }

    get nulo() {
        return this._nulo;
    }
}

module.exports = AtributoTabla;
