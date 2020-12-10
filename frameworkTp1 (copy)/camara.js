function Camara(){
	/*
	1: vista trasera
	2: vista lateral
	3: vista superior
	4: vista orbital desde el helicoptero
	5: vista orbital desde el origen
	*/
	var tipo = 4;
	var camaraOrbital = new CamaraOrbital();

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
		}
	});

	this.actualizarVista = function(control, viewMatrix){
		var pos = control.getPosition();
		var center = vec3.fromValues(pos.x, pos.y, pos.z);

		switch(tipo){
			case 1:
				var rotY = control.getYaw();
				var eye = vec3.fromValues(-1, 0.5, 0);

				vec3.rotateY(eye, eye, [0,0,0], rotY);
				break;

			case 2:
				var rotY = control.getYaw();
				var eye = vec3.fromValues(0, 0, 1);

				vec3.rotateY(eye, eye, [0,0,0], rotY);
				break;

			case 3:
				var rotY = control.getYaw();
				var eye = vec3.fromValues(-0.5, 10, 0);

				vec3.rotateY(eye, eye, [0,0,0], rotY);
				break;

			case 4:
				var rotaciones = camaraOrbital.getRotations();
				var eye = vec3.fromValues(0, 0, 1);

				vec3.rotateY(eye, eye, [0,0,0], rotaciones.Y * (PI/180));
				vec3.rotateX(eye, eye, [0,0,0], rotaciones.X * (PI/180));
				break;

			case 5:
				var rotaciones = camaraOrbital.getRotations();
				var eye = vec3.fromValues(0, 0, 10);

				center = vec3.fromValues(0, 0, 0);

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