class Agua {

	constructor(lado, cantParcelas, latitud, longitud) {

		this.lado = lado;
		this.cantParcelas = cantParcelas;
		this.ladoParcela = lado / cantParcelas;
		this.malla = setupBuffersA(this.ladoParcela, cantParcelas, latitud, longitud);
		this.matrizModelado = mat4.create();
		this.texture = null;
		this.refTexture = null;
	}

	initTexture(archivo_textura){

		var texture = gl.createTexture();
		texture.image = new Image();

		this.texture = texture;
		this.texture.image.onload = function (){

				gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
				gl.bindTexture(gl.TEXTURE_2D, texture);
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
				gl.generateMipmap(gl.TEXTURE_2D);

				gl.bindTexture(gl.TEXTURE_2D, null);
			};
		this.texture.image.src = archivo_textura;
	}

	initRefTexture(file){

		var texture = gl.createTexture();
		texture.image = new Image();

		this.refTexture = texture;
		this.refTexture.image.onload = function (){

				gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
				gl.bindTexture(gl.TEXTURE_2D, texture);
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
				gl.generateMipmap(gl.TEXTURE_2D);

				gl.bindTexture(gl.TEXTURE_2D, null);
			};
		this.refTexture.image.src = file;
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

		setMatrixA(aux, a, b);
		dibujarMallaA(this.malla, this.texture, this.refTexture);

	}

	dibujar(posX, posZ){

		var i = floor((posX + (this.lado / 2)) / this.ladoParcela);
		var j = floor((posZ + (this.lado / 2)) / this.ladoParcela);

		//Dibujo 5x5 parcelas alrededor de (posX, posZ)
		for (var m = -2; m < 3; m++){
			for (var n = -2; n < 3; n++){
				this.dibujarParcela(i+m, j+n);
			}
		}

	}

}

//=========================================================

function setupBuffersA(ladoParcela, cantParcelas, latitud, longitud){

	var pos = [];
	var normal = [];
	var coords = [];

	for (var i = 0; i <= latitud; i++) {
		for (var j = 0; j <= longitud; j++) {

			var x = ((i/latitud))*ladoParcela;
			var z = ((j/longitud))*ladoParcela;
			var y = 1.2;

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

function setMatrixA(mModelado, valorA, valorB){

	gl.uniform1f(glProgramA.a, valorA);

	gl.uniform1f(glProgramA.b, valorB);

	gl.uniformMatrix4fv(glProgramA.modelMatrixUniform, false, mModelado);

	var normalMatrix = mat3.create();
	mat3.fromMat4(normalMatrix, mModelado);

	mat3.invert(normalMatrix,normalMatrix);
	mat3.transpose(normalMatrix,normalMatrix);

	gl.uniformMatrix3fv(glProgramA.normalMatrixUniform, false, normalMatrix);

}

function dibujarMallaA(malla, textura, refTextura){

	// Se configuran los buffers que alimentaron el pipeline
	gl.enableVertexAttribArray(glProgramA.vertexPositionAttribute);
	gl.bindBuffer(gl.ARRAY_BUFFER, malla.positionBuffer);
	gl.vertexAttribPointer(glProgramA.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

	gl.enableVertexAttribArray(glProgramA.vertexUvAttribute);
	gl.bindBuffer(gl.ARRAY_BUFFER, malla.coordsBuffer);
	gl.vertexAttribPointer(glProgramA.vertexUvAttribute, 2, gl.FLOAT, false, 0, 0);

	gl.enableVertexAttribArray(glProgramA.vertexNormalAttribute);
	gl.bindBuffer(gl.ARRAY_BUFFER, malla.normalBuffer);
	gl.vertexAttribPointer(glProgramA.vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);

	gl.activeTexture(gl.TEXTURE5);
	gl.bindTexture(gl.TEXTURE_2D, textura);
	gl.uniform1i(glProgramA.sampler, 5);

	gl.activeTexture(gl.TEXTURE6);
	gl.bindTexture(gl.TEXTURE_2D, refTextura);
	gl.uniform1i(glProgramA.samplerRef, 6);
	   
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, malla.indexBuffer);

	gl.drawElements(gl.TRIANGLE_STRIP, malla.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}