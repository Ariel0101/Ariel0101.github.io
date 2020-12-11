var mat4 = glMatrix.mat4;
var mat3 = glMatrix.mat3;
var vec3 = glMatrix.vec3;

// cte que sirve para hacer un circulo de radio 1
//https://stackoverflow.com/questions/1734745/how-to-create-circle-with-b%C3%A9zier-curves
var magia = 0.552284749831;

//Funcion de escalado que hace que una sup de barrido tenga tapas
var escaladoTapas = function(v){
	if (v == 0 || v == 1){
		return [0, 0, 0];
	}
	return [1, 1, 1];
};

var cos = Math.cos;
var sin = Math.sin;
var PI = Math.PI;
var floor = Math.floor;
var sqrt = Math.sqrt;
var pow = Math.pow;