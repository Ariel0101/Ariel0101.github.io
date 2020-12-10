class HeightMap {

	constructor(lado, cantParcelas, latitud, longitud) {

		this.lado = lado;
		this.cantParcelas = cantParcelas;
		this.ladoParcela = lado / cantParcelas;
		this.malla = setupBuffersHM(this.ladoParcela, cantParcelas, latitud, longitud);
		this.matrizModelado = mat4.create();
		this.texture = null;
	}

	initTexture(archivo_textura, func){

		this.texture = gl.createTexture();
		this.texture.image = new Image();

		this.texture.image.onload = func;
		this.texture.image.src = archivo_textura;
}

	dibujarParcela(i, j) {

		if ((i < 0) || (i > (this.cantParcelas - 1))) return;
		if ((j < 0) || (j > (this.cantParcelas - 1))) return;

		var aux = mat4.create();
		var x = (i * this.ladoParcela) - (this.lado / 2);
		var z = (j * this.ladoParcela) - (this.lado / 2);
		mat4.translate(aux, this.matrizModelado, [x, 0, z]);
		
		var a = j / this.cantParcelas;
		var b = 1 - (i / this.cantParcelas);

		setMatrixHM(aux, a, b);
		dibujarMallaHM(this.malla, this.texture);

	}

	dibujar(posX, posZ){

		var i = floor((posX + (this.lado / 2)) / this.ladoParcela);
		var j = floor((posZ + (this.lado / 2)) / this.ladoParcela);

		this.dibujarParcela(i - 1, j - 1);
		this.dibujarParcela(i - 1, j);
		this.dibujarParcela(i - 1, j + 1);
		this.dibujarParcela(i, j - 1);
		this.dibujarParcela(i, j);
		this.dibujarParcela(i, j + 1);
		this.dibujarParcela(i + 1, j - 1);
		this.dibujarParcela(i + 1, j);
		this.dibujarParcela(i + 1, j + 1);

	}

}

//=========================================================

function setupBuffersHM(ladoParcela, cantParcelas, latitud, longitud){

	var pos = [];
	var normal = [];
	var coords = [];

	for (var i = 0; i <= latitud; i++) {
		for (var j = 0; j <= longitud; j++) {

			var x = ((i/latitud))*ladoParcela;
			var z = ((j/longitud))*ladoParcela;
			var y = 0;

			var u = z / (ladoParcela*cantParcelas);
			var v = 1 - (x / (ladoParcela*cantParcelas));

			normal.push(0);
			normal.push(1);
			normal.push(0);

			coords.push(u);
			coords.push(v);
			
			pos.push(x);
			pos.push(y);
			pos.push(z);


		}
	}

	var positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pos), gl.STATIC_DRAW);  

	var normalBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normal), gl.STATIC_DRAW);

	var coordsBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, coordsBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(coords), gl.STATIC_DRAW);

	var index = [];

	for (i=0; i < latitud; i++) {
		for (j=0; j < longitud; j++) {

			index.push(i*(longitud + 1) + j);
			index.push((i+1)*(longitud + 1) + j);

		}

		index.push((i)*(longitud + 1) + longitud);
		index.push((i+1)*(longitud + 1) + longitud);

		if(i != latitud - 1){
			index.push((i+1)*(longitud + 1) + longitud);
			index.push((i+1)*(longitud + 1));
		}
	}
	
	var indexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(index), gl.STATIC_DRAW);
	indexBuffer.numItems = index.length;

	return {
		positionBuffer,
		normalBuffer,
		coordsBuffer,
		indexBuffer
	}
}

function setMatrixHM(mModelado, valorA, valorB){

	var a = gl.getUniformLocation(glProgramHM, "a");
	gl.uniform1f(a, valorA);

	var b = gl.getUniformLocation(glProgramHM, "b");
	gl.uniform1f(b, valorB);

	var modelMatrixUniform = gl.getUniformLocation(glProgramHM, "modelMatrix");
	gl.uniformMatrix4fv(modelMatrixUniform, false, mModelado);

	var normalMatrix = mat3.create();
	mat3.fromMat4(normalMatrix, mModelado);

	mat4.invert(normalMatrix,normalMatrix);
	mat4.transpose(normalMatrix,normalMatrix);

	var normalMatrixUniform  = gl.getUniformLocation(glProgramHM, "normalMatrix");
	gl.uniformMatrix4fv(normalMatrixUniform, false, normalMatrix);

}

function dibujarMallaHM(malla, textura){
	
	// Se configuran los buffers que alimentaron el pipeline
	var vertexPositionAttribute = gl.getAttribLocation(glProgramHM, "aVertexPosition");
	gl.enableVertexAttribArray(vertexPositionAttribute);
	gl.bindBuffer(gl.ARRAY_BUFFER, malla.positionBuffer);
	gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

	var vertexTextureCoordsAttribute = gl.getAttribLocation(glProgramHM, "aUv");
	gl.enableVertexAttribArray(vertexTextureCoordsAttribute);
	gl.bindBuffer(gl.ARRAY_BUFFER, malla.coordsBuffer);
	gl.vertexAttribPointer(vertexTextureCoordsAttribute, 2, gl.FLOAT, false, 0, 0);

	var vertexNormalAttribute = gl.getAttribLocation(glProgramHM, "aVertexNormal");
	gl.enableVertexAttribArray(vertexNormalAttribute);
	gl.bindBuffer(gl.ARRAY_BUFFER, malla.normalBuffer);
	gl.vertexAttribPointer(vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);

	var sampler = gl.getUniformLocation(glProgramHM, "uSampler");
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, textura);
	gl.uniform1i(sampler, 0);
	   
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, malla.indexBuffer);
	
	var lighting = gl.getUniformLocation(glProgramHM, "uUseLighting");

	gl.uniform1i(lighting, true);
	gl.drawElements(gl.TRIANGLE_STRIP, malla.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

	//gl.uniform1i(lighting, false);
	//gl.drawElements(gl.LINE_STRIP, malla.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}