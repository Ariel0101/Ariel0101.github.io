var superficie3D;
var mallaDeTriangulos;

var superficie3D1;
var mallaDeTriangulo1;

var filas=40;
var columnas=20;

var sin = Math.sin;
var cos = Math.cos;
var sqrt = Math.sqrt;
var pow = Math.pow;
var PI = Math.PI;

var mat3=glMatrix.mat3;
var vec3=glMatrix.vec3;

//---------------------------------------------------------------------
var forma = [vec3.fromValues(1,0,0), vec3.fromValues(0.5,0.86603,0), vec3.fromValues(-0.5,0.86603,0),
             vec3.fromValues(-1,0,0), vec3.fromValues(-0.5,-0.86603,0), vec3.fromValues(0.5,-0.86603,0),
             vec3.fromValues(1,0,0)];

var recorridoM = [vec3.fromValues(0,0,-1), vec3.fromValues(0,0,0), vec3.fromValues(0,0,1)];


var recorridoN = [
                  mat3.fromValues(
                   0,1,0,
                   1,0,0,
                   0,0,1
                  ),
        
                  mat3.fromValues(
                   0,1,0,
                   1,0,0,
                   0,0,1
                  ),

                  mat3.fromValues(
                   0,1,0,
                   1,0,0,
                   0,0,1
                  )
                 ];

//-----------------------------------------------------------------------

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
        //vec3.cross(binormal, tangente, normal);
        vec3.normalize(binormal, binormal);

        var m = mat3.fromValues(...normal,...binormal,...tangente);

        mat3.transpose(m, m);

        matricesNormal.push(m);
    }
    return matricesNormal;
}

//-------------------------------------------------------------------------

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

    this.getNormal = function(t) {
        
        var t0 = this.getTangente(t);
        var t1 = this.getTangente(t+0.001);

        var c = vec3.create();
        var result = vec3.create();

        vec3.cross(c, t0, t1);

        vec3.cross(result, c, t0);

        vec3.normalize(result, result);

        return result;

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

    this.getNormal = function(t) {
        
        var t0 = this.getTangente(t);
        var t1 = this.getTangente(t+0.001);

        var c = vec3.create();
        var result = vec3.create();

        vec3.cross(c, t0, t1);
        vec3.cross(result, c, t0);


        //vec3.cross(result, t1, t0);


        vec3.normalize(result, result);
        //vec3.scale(result, result, -1);

        return result;

    }
}
//-----------------------------------------------------------------------

var controlF = [vec3.fromValues(-0.5,0,0), vec3.fromValues(-0.5,1,0), vec3.fromValues(0.5,1,0), vec3.fromValues(0.5,0,0)];

var controlR = [vec3.fromValues(0,0,0), vec3.fromValues(0,0,3), vec3.fromValues(3,0,3), vec3.fromValues(3,0,0)];
var controlRI = [vec3.fromValues(3,0,0), vec3.fromValues(3,0,3), vec3.fromValues(0,0,3), vec3.fromValues(0,0,0)];


var formaF = new BezierCubic(controlF);

var recorrido = new BezierCubic(controlRI);

var deltaR = columnas;
var deltaF = filas;


var cDebug1 = [vec3.fromValues(0,0,0), vec3.fromValues(-1,1,0), vec3.fromValues(1,1,0), vec3.fromValues(0,0,0)];
var cDebug2 = [vec3.fromValues(0,0,0), vec3.fromValues(1,1,0), vec3.fromValues(1,-1,0), vec3.fromValues(0,0,0)];

var fDebug1 = new BezierCubic(cDebug1);
var fDebug2 = new BezierCubic(cDebug2);

var aDebug1 = discretizarCurva(fDebug1, columnas);
var aDebug2 = discretizarCurva(fDebug2, columnas);

var bDebug = discretizarCurva(recorrido, filas);

var cDebug = discretizarRecorrido(recorrido, filas);

//-----------------------------------------------------------------------

var SUPERFICIE = 4; //0:Plano - 1:Esfera - 2:TuboSenoidal - 3:Barrido
var DICC = {0: new Plano(4, 4), 
                1: new Esfera(3),
                2: new TuboSenoidal(0.05, 0.125, 0.5, 3),
                3: new SuperficieBarrido(discretizarCurva(formaF, deltaF), recorridoM, recorridoN, filas, columnas),
                4: new SuperficieBarrido(discretizarCurva(formaF, deltaF), discretizarCurva(recorrido,deltaR), discretizarRecorrido(recorrido,deltaR), filas, columnas)
            }; 


function crearGeometria(){
        

    superficie3D= new SuperficieBarrido(aDebug1, bDebug, cDebug, filas, columnas);
    superficie3D1= new SuperficieBarrido(aDebug2, bDebug, cDebug, filas, columnas);
    mallaDeTriangulos=generarSuperficie(superficie3D,filas,columnas);
    mallaDeTriangulo1=generarSuperficie(superficie3D1,filas,columnas);
    
}

function dibujarGeometria(){

    //dibujarMalla(mallaDeTriangulos);
    dibujarMalla(mallaDeTriangulo1);

}


/*
@forma : array de vec3
@recorridoM : array de vec3
@recorridoN : array de mat3
@niveles : int
@vertices : int
*/

function SuperficieBarrido(forma, recorridoM, recorridoN, niveles, vertices) {


    this.getPosicion=function(u,v){
        var vectorModelado = recorridoM[v*niveles];
        var matrizNormal = recorridoN[v*niveles];

        var vertice = forma[u*vertices];

        var nuevoVertice = vec3.create();
        mat3.multiply(nuevoVertice, matrizNormal, vertice);

        //console.log(matrizNormal);
        //console.log(vertice);
        //console.log(nuevoVertice);

        vec3.add(nuevoVertice, nuevoVertice, vectorModelado);

        return nuevoVertice;
    }

    this.getNormal=function(u,v){
        var matrizNormal = mat3.fromValues(recorridoN[v*niveles]);
        return matrizNormal[0];
    }

    this.getCoordenadasTextura=function(u,v){
        return [u,v];
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

    this.getCoordenadasTextura=function(u,v){
        return [u,v];
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

    this.getCoordenadasTextura=function(u,v){
        return [u,v];
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

    this.getCoordenadasTextura=function(u,v){
        return [u,v];
    }
}


function generarSuperficie(superficie,filas,columnas){
    
    positionBuffer = [];
    normalBuffer = [];
    uvBuffer = [];

    for (var i=0; i <= filas; i++) {
        for (var j=0; j <= columnas; j++) {

            var u=j/columnas;
            var v=i/filas;

            var pos=superficie.getPosicion(u,v);

            positionBuffer.push(pos[0]);
            positionBuffer.push(pos[1]);
            positionBuffer.push(pos[2]);

            var nrm=superficie.getNormal(u,v);

            normalBuffer.push(nrm[0]);
            normalBuffer.push(nrm[1]);
            normalBuffer.push(nrm[2]);

            var uvs=superficie.getCoordenadasTextura(u,v);

            uvBuffer.push(uvs[0]);
            uvBuffer.push(uvs[1]);

        }
    }

    // Buffer de indices de los triángulos
    indexBuffer=[];


    for (i=0; i < filas; i++) {
        for (j=0; j < columnas; j++) {

            indexBuffer.push(i*(columnas + 1) + j);
            indexBuffer.push((i+1)*(columnas + 1) + j);

        }

        indexBuffer.push((i)*(columnas + 1) + columnas);
        indexBuffer.push((i+1)*(columnas + 1) + columnas);

        if(i != filas - 1){
            indexBuffer.push((i+1)*(columnas + 1) + columnas);
            indexBuffer.push((i+1)*(columnas + 1));
        }
    }


    // Creación e Inicialización de los buffers

    webgl_position_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, webgl_position_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positionBuffer), gl.STATIC_DRAW);
    webgl_position_buffer.itemSize = 3;
    webgl_position_buffer.numItems = positionBuffer.length / 3;

    webgl_normal_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, webgl_normal_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalBuffer), gl.STATIC_DRAW);
    webgl_normal_buffer.itemSize = 3;
    webgl_normal_buffer.numItems = normalBuffer.length / 3;

    webgl_uvs_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, webgl_uvs_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvBuffer), gl.STATIC_DRAW);
    webgl_uvs_buffer.itemSize = 2;
    webgl_uvs_buffer.numItems = uvBuffer.length / 2;


    webgl_index_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, webgl_index_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexBuffer), gl.STATIC_DRAW);
    webgl_index_buffer.itemSize = 1;
    webgl_index_buffer.numItems = indexBuffer.length;

    return {
        webgl_position_buffer,
        webgl_normal_buffer,
        webgl_uvs_buffer,
        webgl_index_buffer
    }
}

function dibujarMalla(mallaDeTriangulos){
    
    // Se configuran los buffers que alimentaron el pipeline
    gl.bindBuffer(gl.ARRAY_BUFFER, mallaDeTriangulos.webgl_position_buffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, mallaDeTriangulos.webgl_position_buffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, mallaDeTriangulos.webgl_uvs_buffer);
    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, mallaDeTriangulos.webgl_uvs_buffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, mallaDeTriangulos.webgl_normal_buffer);
    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, mallaDeTriangulos.webgl_normal_buffer.itemSize, gl.FLOAT, false, 0, 0);
       
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mallaDeTriangulos.webgl_index_buffer);


    if (modo!="wireframe"){
        gl.uniform1i(shaderProgram.useLightingUniform,(lighting=="true"));                    
        /*
            Aqui es necesario modificar la primitiva por triangle_strip
        */
        gl.drawElements(gl.TRIANGLE_STRIP, mallaDeTriangulos.webgl_index_buffer.numItems, gl.UNSIGNED_SHORT, 0);
    }
    
    if (modo!="smooth") {
        gl.uniform1i(shaderProgram.useLightingUniform,false);
        gl.drawElements(gl.LINE_STRIP, mallaDeTriangulos.webgl_index_buffer.numItems, gl.UNSIGNED_SHORT, 0);
    }
 
}

