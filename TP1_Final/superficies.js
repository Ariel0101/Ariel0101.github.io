/*
@forma : curva
@recorrido : curva
@rotar: int function(int)
@escalar: vec3 function(int)
*/
function SuperficieBarrido(forma, recorrido, escalar = null, rotar = null) {

    this.getPosicion = function(u,v){
        var vectorModelado = recorrido.getPosicion(v);
        var matrizNormal = recorrido.getTerna(v);

        var vertice = forma.getPosicion(u);

        if (rotar){
            mat3.rotate(matrizNormal, matrizNormal, rotar(v));
        }

        if (escalar){
            mat3.scale(matrizNormal, matrizNormal, escalar(v));
        }

        var nuevoVertice = vec3.create();
        mat3.multiply(nuevoVertice, matrizNormal, vertice);

        vec3.add(nuevoVertice, nuevoVertice, vectorModelado);

        return nuevoVertice;
    }

    this.getNormal=function(u,v){
        var matrizNormal = recorrido.getNormal(v);
        return [matrizNormal[0], matrizNormal[1], matrizNormal[2]];
    }
}

function Plano(ancho,largo){

    this.getPosicion=function(u,v){

        var x=(u-0.5)*ancho;
        var z=(v-0.5)*largo;
        return [x,0,z];
    }

    this.getNormal=function(u,v){
        return [0,1,0];
    }
}


function Esfera(radio){

    this.getPosicion=function(u,v){

        var x=radio*cos(u*2*PI)*sin(v*PI);
        var y=radio*cos(v*PI);
        var z=radio*sin(u*2*PI)*sin(v*PI);
        return [x,y,z];
    }

    this.getNormal=function(u,v){
        var r = this.getPosicion(u,v);
        return [(r[0]/radio), (r[1]/radio), (r[2]/radio)];
    }
}

function restarVectores(a, b){
    var r = [];
    for (var i = 0; i < a.length; i++) {
        r[i] = a[i] - b[i];
    }
    return r;
}

function TuboSenoidal(amplitud, lambda, radio, alto){

    this.getPosicion=function(u,v){

        var aux = amplitud*sin((2*PI/lambda)*v);
        var x=(radio + aux)*cos(u*2*PI);
        var y=(v-0.5)*alto;
        var z=(radio + aux)*sin(u*2*PI);
        return [x,y,z];
    }

    this.getNormal=function(u,v){
        var pos = this.getPosicion(u,v);
        var a = restarVectores(this.getPosicion(u+0.001,v), pos);
        var b = restarVectores(this.getPosicion(u,v+0.001), pos);
        return [(a[1]*b[2] - b[1]*a[2]), (a[0]*b[2] - b[0]*a[2]), (a[0]*b[1] - b[0]*a[1])];
    }
}