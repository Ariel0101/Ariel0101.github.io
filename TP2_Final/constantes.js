var mat4 = glMatrix.mat4;
var mat3 = glMatrix.mat3;
var vec3 = glMatrix.vec3;

// cte que sirve para hacer un circulo de radio 1
//https://stackoverflow.com/questions/1734745/how-to-create-circle-with-b%C3%A9zier-curves
var magia = 0.552284749831;

//Funcion de escalado que hace que una sup de barrido tenga tapas
var escaladoTapas = function(v){
	var aux = 1;
	if (v < 0.25){
		aux = 2 * sqrt(v);
	}
	if (v > 0.75){
		aux = 2 * sqrt(-v + 1);
	}
	return [aux, aux, aux];
};

var cos = Math.cos;
var sin = Math.sin;
var PI = Math.PI;
var floor = Math.floor;
var sqrt = Math.sqrt;
var pow = Math.pow;
var atan = Math.atan;

var epsilon = 0.01;

//========================================================================
//var colorCuerpo = [215/255, 211/255, 186/255];
var colorTerreno = [54/255, 34/255, 4/255];
var colorCielo = [97/255, 133/255, 214/255];
var colorCuerpo = [67/255, 82/255, 116/255];
var colorCola = [215/255, 211/255, 186/255];
var colorRotores = [43/255, 45/255, 47/255];
var colorHelices = [87/255, 89/255, 93/255];
var colorPatines = [0, 0, 0];
var colorControles = [151/255, 21/255, 0/255];
var colorHelipuerto = [36/255, 36/255, 36/255];
var colorBase = [20/255, 100/255, 20/255];
