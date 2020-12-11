function Camara(){
	/*
	1: vista trasera
	2: vista lateral
	3: vista superior
	4: vista orbital desde el helicoptero
	5: vista orbital desde el origen
	*/
	var tipo = 1;
	var camaraOrbital = new CamaraOrbital();
	var distancia = 0.5;
	var velocZoom = 0.01;

	$("body").keydown(function(e){
		switch(e.key){
			case "1":
				tipo = 1;
				break;

			case "2":
				tipo = 2;
				break;       

			case "3":
				tipo = 3;
				break;

			case "4":
				tipo = 4;
				break;

			case "5":
				tipo = 5;
				break;

			case "+":
				distancia -= velocZoom;
				if (distancia <= 0.01) distancia = 0.01;
				break;

			case "-":
				distancia += velocZoom;
				if (distancia > 20) distancia = 20;
				break;
		}
	});

	this.actualizarVista = function(heli, viewMatrix){
		var pos = heli.getPosition();
		var center = vec3.fromValues(pos.x, pos.y, pos.z);

		switch(tipo){
			case 1:
				var rotY = heli.getYaw();
				var eye = vec3.fromValues(-0.3, 0.2, 0);

				vec3.rotateY(eye, eye, [0,0,0], rotY);
				break;

			case 2:
				var rotY = heli.getYaw();
				var eye = vec3.fromValues(0, 0.05, 0.25);

				vec3.rotateY(eye, eye, [0,0,0], rotY);
				break;

			case 3:
				var rotY = heli.getYaw();
				var eye = vec3.fromValues(-0.5, 2, 0);

				vec3.rotateY(eye, eye, [0,0,0], rotY);
				break;

			case 4:
				var rotaciones = camaraOrbital.getRotations();
				var eye = vec3.fromValues(-distancia, 0, 0);

				vec3.rotateY(eye, eye, [0,0,0], rotaciones.Y * (PI/180));
				vec3.rotateX(eye, eye, [0,0,0], rotaciones.X * (PI/180));
				break;

			case 5:
				var rotaciones = camaraOrbital.getRotations();
				var eye = vec3.fromValues(-5*distancia, 0, 0);

				center = vec3.fromValues(0, 2, 0);

				vec3.rotateY(eye, eye, [0,0,0], rotaciones.Y * (PI/180));
				vec3.rotateX(eye, eye, [0,0,0], rotaciones.X * (PI/180));
				break;
		}

		vec3.add(eye, eye, center);

		mat4.lookAt(viewMatrix,
			eye,
			center,
			vec3.fromValues(0, 1, 0)
		);

	}
}

function CamaraOrbital(){

	var mouseDown = false;
	var mouseX = 0.0;
	var mouseY = 0.0;
	var rotarCamaraX = 0.0;
	var rotarCamaraY = 0.0;

	onmousedown = function(){
		mouseDown = true;
	}

	onmouseup = function(){
		mouseDown = false;
	}

	onmousemove = function(e){
		var x = e.clientX;
		var y = e.clientY;

		if(mouseDown){
			rotarCamaraY = (rotarCamaraY + (x - mouseX));
			rotarCamaraX = (rotarCamaraX + (y - mouseY));  
		}

		if (rotarCamaraX > 90) {
			rotarCamaraX = 90;
		}
		if (rotarCamaraX < -90) {
			rotarCamaraX = -90;
		}

		
		mouseX = x;
		mouseY = y;
	}

	this.getRotations = function(){
		return {
			X : rotarCamaraX,
			Y : rotarCamaraY
		}
	}
}