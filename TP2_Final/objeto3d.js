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

		this.textura = null;
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

	initTexture(archivo){

		var textura = gl.createTexture();
		textura.image = new Image();
		
		this.textura = textura;

		this.textura.image.onload = function () {

				gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
				gl.bindTexture(gl.TEXTURE_2D, textura);
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textura.image);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
				gl.generateMipmap(gl.TEXTURE_2D);

				gl.bindTexture(gl.TEXTURE_2D, null);
			};
		this.textura.image.src = archivo;
	}

	dibujar(matPadre) {

		var m = mat4.create();
		this.actualizarMatrizModelado();
		mat4.multiply(m, matPadre, this.matrizModelado);

		if (this.malla){
			setMatrix(m, this.color);
			dibujarMalla(this.malla, this.textura);
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

			uv.push(u);
			uv.push(v);

		}
	}

	positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pos), gl.STATIC_DRAW);    


	normalBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normal), gl.STATIC_DRAW);


	uvBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.STATIC_DRAW);

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
		indexBuffer,
		uvBuffer
	}  
}

function setMatrix(mModelado, color){

	gl.uniformMatrix4fv(glProgram.modelMatrixUniform, false, mModelado);

	var normalMatrix = mat3.create();
	mat3.fromMat4(normalMatrix, mModelado);

	mat3.invert(normalMatrix, normalMatrix);
	mat3.transpose(normalMatrix, normalMatrix);

	gl.uniformMatrix3fv(glProgram.normalMatrixUniform, false, normalMatrix);

	gl.uniform3fv(glProgram.rgb, color);
	gl.uniform3fv(glProgram.ambientLighting, [0.7, 0.7, 0.7]);
	gl.uniform3fv(glProgram.lightVec, [1.0, 3.0, 0.0]);
	gl.uniform3fv(glProgram.lightColor, [1.0, 1.0, 1.0]);
}

function dibujarMalla(malla, textura){
	
	// Se configuran los buffers que alimentaron el pipeline
	gl.enableVertexAttribArray(glProgram.vertexPositionAttribute);
	gl.bindBuffer(gl.ARRAY_BUFFER, malla.positionBuffer);
	gl.vertexAttribPointer(glProgram.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

	gl.enableVertexAttribArray(glProgram.vertexNormalAttribute);
	gl.bindBuffer(gl.ARRAY_BUFFER, malla.normalBuffer);
	gl.vertexAttribPointer(glProgram.vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);

	gl.enableVertexAttribArray(glProgram.vertexUvAttribute);
	gl.bindBuffer(gl.ARRAY_BUFFER, malla.uvBuffer);
	gl.vertexAttribPointer(glProgram.vertexUvAttribute, 2, gl.FLOAT, false, 0, 0);

	gl.uniform1i(glProgram.useTexture, (textura != null));
	if (textura){
		gl.activeTexture(gl.TEXTURE4);
		gl.bindTexture(gl.TEXTURE_2D, textura);
		gl.uniform1i(glProgram.sampler, 4);
	}
	   
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, malla.indexBuffer);

	gl.uniform1i(glProgram.lighting, true);
	gl.drawElements(gl.TRIANGLE_STRIP, malla.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
	
	if (mostrarMalla){
		gl.uniform1i(glProgram.lighting, false);
		gl.drawElements(gl.LINE_STRIP, malla.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
	}
}