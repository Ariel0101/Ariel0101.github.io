class Objeto3D {

	constructor(superficie = null, filas = 20, columnas = 20, color = [1, 1, 1]) {

		this.color = vec3.fromValues(...color);
		this.malla = null;
		if (superficie){
			this.malla = setupBuffers(superficie, filas, columnas);
		}
		
		this.matrizModelado = mat4.create();
		this.posicion = vec3.create();
		this.rotacion = vec3.create();
		this.escala = vec3.fromValues(1,1,1);
		this.hijos = [];
	}

	actualizarMatrizModelado() {
		//Reseteo la matriz de modelado
		mat4.identity(this.matrizModelado);

		mat4.translate(this.matrizModelado, this.matrizModelado, this.posicion);

		mat4.rotate(this.matrizModelado, this.matrizModelado, this.rotacion[1], [0,1,0]);
		mat4.rotate(this.matrizModelado, this.matrizModelado, this.rotacion[2], [0,0,1]);
		mat4.rotate(this.matrizModelado, this.matrizModelado, this.rotacion[0], [1,0,0]);

		mat4.scale(this.matrizModelado, this.matrizModelado, this.escala);

	}

	dibujar(matPadre) {

		var m = mat4.create();
		this.actualizarMatrizModelado();
		mat4.multiply(m, matPadre, this.matrizModelado);

		if (this.malla){
			setMatrix(m, this.color);
			dibujarMalla(this.malla);
		}

		for (var i = 0; i < this.hijos.length; i++){
			this.hijos[i].dibujar(m);
		}

	}

	agregarHijo(h) {
		this.hijos.push(h);
	}

	quitarHijo(h) {
		const index = this.hijos.indexOf(h);
		if (index > -1) {
				this.hijos.splice(index, 1);
		}
	}

	setPosicion(x, y, z) {
		vec3.set(this.posicion, x, y, z);
	}

	setRotacion(x, y, z) {
		vec3.set(this.rotacion, x, y, z);
	}

	setEscala(x, y, z) {
		vec3.set(this.escala, x, y, z);
	}
}

//=========================================================

function setupBuffers(superficie, filas, columnas){

	var pos = [];
	var normal = [];
	var uv = [];

	for (var i=0; i <= filas; i++) {
		for (var j=0; j <= columnas; j++) {

			var u=j/columnas;
			var v=i/filas;

			var pos_aux = superficie.getPosicion(u,v);

			pos.push(pos_aux[0]);
			pos.push(pos_aux[1]);
			pos.push(pos_aux[2]);

			var nrm_aux = superficie.getNormal(u,v);

			normal.push(nrm_aux[0]);
			normal.push(nrm_aux[1]);
			normal.push(nrm_aux[2]);

		}
	}

	positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pos), gl.STATIC_DRAW);    


	normalBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normal), gl.STATIC_DRAW);

	var index = [];

	for (i=0; i < filas; i++) {
		for (j=0; j < columnas; j++) {

			index.push(i*(columnas + 1) + j);
			index.push((i+1)*(columnas + 1) + j);

		}

		index.push((i)*(columnas + 1) + columnas);
		index.push((i+1)*(columnas + 1) + columnas);

		if(i != filas - 1){
			index.push((i+1)*(columnas + 1) + columnas);
			index.push((i+1)*(columnas + 1));
		}
	}
	
	
	indexBuffer = gl.createBuffer();
	indexBuffer.numItems = index.length;
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(index), gl.STATIC_DRAW);

	return {
		positionBuffer,
		normalBuffer,
		indexBuffer

	}  
}

function setMatrix(mModelado, color){

	var modelMatrixUniform = gl.getUniformLocation(glProgram, "modelMatrix");
	gl.uniformMatrix4fv(modelMatrixUniform, false, mModelado);

	var normalMatrix = mat3.create();
	mat3.fromMat4(normalMatrix, mModelado);

	mat4.invert(normalMatrix,normalMatrix);
	mat4.transpose(normalMatrix,normalMatrix);

	var normalMatrixUniform  = gl.getUniformLocation(glProgram, "normalMatrix");
	gl.uniformMatrix4fv(normalMatrixUniform, false, normalMatrix);

	var rgb = gl.getUniformLocation(glProgram, "RGB");
	gl.uniform3fv(rgb, color);

}

function dibujarMalla(malla){
	
	// Se configuran los buffers que alimentaron el pipeline
	var vertexPositionAttribute = gl.getAttribLocation(glProgram, "aVertexPosition");
	gl.enableVertexAttribArray(vertexPositionAttribute);
	gl.bindBuffer(gl.ARRAY_BUFFER, malla.positionBuffer);
	gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

	var vertexNormalAttribute = gl.getAttribLocation(glProgram, "aVertexNormal");
	gl.enableVertexAttribArray(vertexNormalAttribute);
	gl.bindBuffer(gl.ARRAY_BUFFER, malla.normalBuffer);
	gl.vertexAttribPointer(vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);
	   
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, malla.indexBuffer);
	
	var lighting = gl.getUniformLocation(glProgram, "uUseLighting");

	gl.uniform1i(lighting, true);
	gl.drawElements(gl.TRIANGLE_STRIP, malla.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
	
	if (mostrarMalla){
		gl.uniform1i(lighting, false);
		gl.drawElements(gl.LINE_STRIP, malla.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
	}
}