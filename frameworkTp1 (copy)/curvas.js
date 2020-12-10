/*
@puntos : array de arrays de vec3
*/
class CurvaMultiple {

    constructor(puntos, cantCurvas){
        this.curvas = [];
        this.n = cantCurvas;
        for (var i = 0; i < cantCurvas; i++){
            if (puntos[i].length == 4){
                this.curvas.push(new BezierCubic(puntos[i]));
            }
            if (puntos[i].length == 3){
                this.curvas.push(new BezierQuadratic(puntos[i]));
            }
        }
    }

    indiceCurva(t){
        var i = floor(t * this.n);
        if (i == this.n){
            i -= 1;
        }
        var fp = (t * this.n) - i;
        return {
            indice : i,
            k : fp
        }
    }

    getPosicion(t){
        var nuevo = this.indiceCurva(t);
        return this.curvas[nuevo.indice].getPosicion(nuevo.k);
    }

    getTangente(t){
        var nuevo = this.indiceCurva(t);
        return this.curvas[nuevo.indice].getTangente(nuevo.k);
    }

    getNormal(t){
        var nuevo = this.indiceCurva(t);
        return this.curvas[nuevo.indice].getNormal(nuevo.k);
    }

    getTerna(t){
        var nuevo = this.indiceCurva(t);
        return this.curvas[nuevo.indice].getTerna(nuevo.k);
    }

}

/*
@puntos : array de vec3
*/
function BezierQuadratic(puntos) {

    this.getPosicion = function(t) {

        var p0 = vec3.clone(puntos[0]);
        var p1 = vec3.clone(puntos[1]);
        var p2 = vec3.clone(puntos[2]);

        vec3.scale(p0, p0, Math.pow(1-t,2));
        vec3.scale(p1, p1, 2*t*(1-t));
        vec3.scale(p2, p2, Math.pow(t,2));

        var result = vec3.create();
        vec3.add(result, result, p0);
        vec3.add(result, result, p1);
        vec3.add(result, result, p2);

        return result;
    }

    this.getTangente = function(t) {

        var p0 = vec3.create();
        var p1 = vec3.create();

        vec3.subtract(p0, puntos[1], puntos[0]);
        vec3.subtract(p1, puntos[2], puntos[1]);

        vec3.scale(p0, p0, 2*(1-t));
        vec3.scale(p1, p1, 2*t);

        var result = vec3.create();
        vec3.add(result, p0, p1);

        vec3.normalize(result, result);

        return result;
    }

    this.anteriorNormal = vec3.zero(vec3.create());

    this.getNormal = function(t) {
        
        var result = vec3.create();
        var t0 = this.getTangente(t);
        var t1 = this.getTangente(t+0.001);
        var c = vec3.create();

        vec3.cross(c, t0, t1);
        vec3.cross(result, c, t0);

        if (vec3.squaredLength(result) == 0){
            var aux = vec3.fromValues(0,0,1);
            vec3.cross(result, t0, aux);
            if (vec3.squaredLength(result) == 0){
                vec3.set(aux, 0, 1, 0);
                vec3.cross(result, t0, aux);
            }
            vec3.normalize(result, result);
            this.anteriorNormal = result;
            return result;
        }

        vec3.normalize(result, result);

        if (vec3.squaredLength(this.anteriorNormal) != 0){
            var a = vec3.angle(this.anteriorNormal, result);
            var err = Math.abs(1*Math.PI - a);
            if (err <= 0.5*Math.PI){
                vec3.scale(result,result,-1);
            }
        }

        this.anteriorNormal = result;

        return result;
    }

    this.getTerna = function(t) {
        var normal = this.getNormal(t);
        var tangente = this.getTangente(t);
        var binormal = vec3.create();
        vec3.cross(binormal, normal, tangente);

        return mat3.fromValues(...normal,...binormal,...tangente);
    }
}

/*
@puntos : array de vec3
*/
function BezierCubic(puntos) {

    this.getPosicion = function(t) {

        var p0 = vec3.clone(puntos[0]);
        var p1 = vec3.clone(puntos[1]);
        var p2 = vec3.clone(puntos[2]);
        var p3 = vec3.clone(puntos[3]);

        vec3.scale(p0, p0, Math.pow(1-t,3));
        vec3.scale(p1, p1, 3*Math.pow(1-t,2)*t);
        vec3.scale(p2, p2, 3*(1-t)*Math.pow(t,2));
        vec3.scale(p3, p3, Math.pow(t,3));

        var result = vec3.create();
        vec3.add(result, p0, p1);
        vec3.add(result, result, p2);
        vec3.add(result, result, p3);

        return result;
    }

    this.getTangente = function(t) {

        var p0 = vec3.create();
        var p1 = vec3.create();
        var p2 = vec3.create();

        vec3.subtract(p0, puntos[1], puntos[0]);
        vec3.subtract(p1, puntos[2], puntos[1]);
        vec3.subtract(p2, puntos[3], puntos[2]);

        vec3.scale(p0, p0, 3*Math.pow(1-t,2));
        vec3.scale(p1, p1, 3*2*(1-t)*t);
        vec3.scale(p2, p2, 3*Math.pow(t,2));

        var result = vec3.create();
        vec3.add(result, p0, p1);
        vec3.add(result, result, p2);

        vec3.normalize(result, result);

        return result;
    }

    this.anteriorNormal = vec3.zero(vec3.create());

    this.getNormal = function(t) {
        
        var result = vec3.create();
        var t0 = this.getTangente(t);
        var t1 = this.getTangente(t+0.01);

        var c = vec3.create();

        vec3.cross(c, t0, t1);
        vec3.cross(result, c, t0);

        if (vec3.squaredLength(result) == 0){
            var aux = vec3.fromValues(0,0,1);
            vec3.cross(result, t0, aux);
            if (vec3.squaredLength(result) == 0){
                vec3.set(aux, 0, 1, 0);
                vec3.cross(result, t0, aux);
            }
            vec3.normalize(result, result);
            this.anteriorNormal = result;
            return result;
        }

        vec3.normalize(result, result);

        if (vec3.squaredLength(this.anteriorNormal) != 0){
            var a = vec3.angle(this.anteriorNormal, result);
            var err = Math.abs(1*Math.PI - a);
            if (err <= 0.5*Math.PI){
                vec3.scale(result,result,-1);
            }
        }
        
        this.anteriorNormal = result;

        return result;
    }

    this.getTerna = function(t) {
        var normal = this.getNormal(t);
        var tangente = this.getTangente(t);
        var binormal = vec3.create();
        vec3.cross(binormal, normal, tangente);

        return mat3.fromValues(...normal,...binormal,...tangente);
    }
}

//===================================================================

function discretizarCurva(curva, pasos) {
    var curvaDiscreta = [];
    for (var i = 0; i <= pasos; i++) {
        curvaDiscreta.push(curva.getPosicion(i/pasos));
    }
    return curvaDiscreta;
}


function discretizarRecorrido(curva, pasos) {
    var matricesNormal = [];
    for (var i = 0; i <= pasos; i++) {

        var normal = curva.getNormal(i/pasos);
        var tangente = curva.getTangente(i/pasos);
        var binormal = vec3.create();
        vec3.cross(binormal, normal, tangente);

        var m = mat3.fromValues(...normal,...binormal,...tangente);

        matricesNormal.push(m);
    }
    return matricesNormal;
}