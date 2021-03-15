class HeightMap {

	constructor(lado, cantParcelas, latitud, longitud) {

		this.lado = lado;
		this.cantParcelas = cantParcelas;
		this.ladoParcela = lado / cantParcelas;
		this.malla = setupBuffersHM(this.ladoParcela, cantParcelas, latitud, longitud);
		this.matrizModelado = mat4.create();
		this.texture = null;
		this.mascara = null;
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

	setMascara(mascara){
		this.mascara = mascara;
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

		//Dibujo 5x5 parcelas alrededor de (posX, posZ)
		for (var m = -2; m < 3; m++){
			for (var n = -2; n < 3; n++){
				this.dibujarParcela(i+m, j+n);
			}
		}

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
		coordsBuffer,
		indexBuffer
	}
}

function setMatrixHM(mModelado, valorA, valorB){

	gl.uniform1f(glProgramHM.a, valorA);

	gl.uniform1f(glProgramHM.b, valorB);

	gl.uniformMatrix4fv(glProgramHM.modelMatrixUniform, false, mModelado);

	var normalMatrix = mat3.create();
	mat3.fromMat4(normalMatrix, mModelado);

	mat3.invert(normalMatrix,normalMatrix);
	mat3.transpose(normalMatrix,normalMatrix);

	gl.uniformMatrix3fv(glProgramHM.normalMatrixUniform, false, normalMatrix);

}

function dibujarMallaHM(malla, textura){


	// Se configuran los buffers que alimentaron el pipeline
	gl.enableVertexAttribArray(glProgramHM.vertexPositionAttribute);
	gl.bindBuffer(gl.ARRAY_BUFFER, malla.positionBuffer);
	gl.vertexAttribPointer(glProgramHM.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

	gl.enableVertexAttribArray(glProgramHM.vertexUvAttribute);
	gl.bindBuffer(gl.ARRAY_BUFFER, malla.coordsBuffer);
	gl.vertexAttribPointer(glProgramHM.vertexUvAttribute, 2, gl.FLOAT, false, 0, 0);

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, textura);
	gl.uniform1i(glProgramHM.sampler, 0);

	this.mascara.setUpColores(1, -0.5, 0.5);
	   
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, malla.indexBuffer);

	gl.uniform1i(glProgramHM.lighting, true);
	gl.drawElements(gl.TRIANGLE_STRIP, malla.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);


}