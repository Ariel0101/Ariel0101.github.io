class MascaraHM {

	constructor(){

		this.texturas = []

	}

	initTexture(archivo_textura){

		var textura = gl.createTexture();
		textura.image = new Image();

		this.texturas.push(textura)

		textura.image.onload = function () {
			
				gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); 					// invierto el ejeY
				gl.bindTexture(gl.TEXTURE_2D, textura); 						// activo la textura
				
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textura.image);	// cargo el bitmap en la GPU
				
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);					// selecciono filtro de magnificacion
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);	// selecciono filtro de minificacion
				
				gl.generateMipmap(gl.TEXTURE_2D);		// genero los mipmaps
				gl.bindTexture(gl.TEXTURE_2D, null);

				totalTexturas--;
				if (totalTexturas==0) fase();
				
			};
		textura.image.src = archivo_textura;
	}

	setUpColores(scale1, low, high){

		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, this.texturas[0]);
		gl.uniform1i(glProgramHM.samplerUniform0, 1);

		gl.activeTexture(gl.TEXTURE2);
		gl.bindTexture(gl.TEXTURE_2D, this.texturas[1]);
		gl.uniform1i(glProgramHM.samplerUniform1, 2);

		gl.activeTexture(gl.TEXTURE3);
		gl.bindTexture(gl.TEXTURE_2D, this.texturas[2]);
		gl.uniform1i(glProgramHM.samplerUniform2, 3);

		gl.uniform1f(gl.getUniformLocation(glProgramHM, "scale1"), scale1);
		/*gl.uniform1f(gl.getUniformLocation(glProgramHM, "low"), low);
		gl.uniform1f(gl.getUniformLocation(glProgramHM, "high"), high);*/

	}
}