class Helicoptero {
	
	constructor(){

		//============================================================================
		var controlFormaCuerpo = [
								   [vec3.fromValues(-1.5, -0.5, 0),
								    vec3.fromValues(-1.84, 0.44, 0),
								    vec3.fromValues(0.63, 0.793, 0),
								    vec3.fromValues(1, 0.5, 0)],

								   [vec3.fromValues(1, 0.5, 0),
								    vec3.fromValues(1.92, -0.745, 0),
								    vec3.fromValues(-1.21, -1.363, 0),
								    vec3.fromValues(-1.5, -0.5, 0)]
								 ]
		
		var formaCuerpo = new CurvaMultiple(controlFormaCuerpo, 2); 

		var controlRecorridoZ = [vec3.fromValues(0, 0, -1),
									  vec3.fromValues(0, 0, -0.5),
									  vec3.fromValues(0, 0, 0.5),
									  vec3.fromValues(0, 0, 1)
									 ]

		var recorridoZ = new BezierCubic(controlRecorridoZ);


		var escaladoCuerpo = function(v){
			if (v == 0){
				return [0,0,0];
			}
			if (v == 1){
				return [0,0,0];
			}
			if (v < 0.2){
				var aux = (sqrt((pow(0.3,2))-(pow(v-0.3,2))) + 0.7);
				return [aux, aux, aux];
			}
			if (v > 0.8){
				var aux = (sqrt((pow(0.3,2))-(pow(v-0.7,2))) + 0.7);
				return [aux, aux, aux];
			}
			return [1,1,1];
		}
		var supCuerpo = new SuperficieBarrido(formaCuerpo, recorridoZ, null, escaladoCuerpo);

		this.cuerpo = new Objeto3D(supCuerpo, 50, 50, [0, 1, 0]);
		this.cuerpo.setEscala(0.1, 0.09, 0.07);

		//===================================================================================

		var magia = 0.552284749831
		var controlFormaCirculo =
		[
			[vec3.fromValues(1, 0, 0),
			 vec3.fromValues(1, magia, 0),
			 vec3.fromValues(magia, 1, 0),
			 vec3.fromValues(0, 1, 0)
			],
			[vec3.fromValues(0, 1, 0),
			 vec3.fromValues(-magia, 1, 0),
			 vec3.fromValues(-1, magia, 0),
			 vec3.fromValues(-1, 0, 0)
			],
			[vec3.fromValues(-1, 0, 0),
			 vec3.fromValues(-1, -magia, 0),
			 vec3.fromValues(-magia, -1, 0),
			 vec3.fromValues(0, -1, 0)
			],
			[vec3.fromValues(0, -1, 0),
			 vec3.fromValues(magia, -1, 0),
			 vec3.fromValues(1, -magia, 0),
			 vec3.fromValues(1, 0, 0)
			]

		];

		var formaCirculo = new CurvaMultiple(controlFormaCirculo, 4);

		var controlRecorridoX = [vec3.fromValues(-1, 0, 0),
									  vec3.fromValues(-0.5, 0, 0),
									  vec3.fromValues(0.5, 0, 0),
									  vec3.fromValues(1, 0, 0)
									 ]

		var recorridoX = new BezierCubic(controlRecorridoX);

		var cilindro = new Objeto3D(new SuperficieBarrido(formaCirculo, recorridoX), 20, 20);
		this.cuerpo.agregarHijo(cilindro);


	}

	actualizar(control){
		var pos = control.getPosition();
		var rotX = control.getRoll();
		var rotY = control.getYaw();
		var rotZ = control.getPitch();

		this.cuerpo.setPosicion(pos.x, pos.y, pos.z);
		this.cuerpo.setRotacion(rotX, rotY, rotZ);

		var c = cos(17*time + control.getSpeed());
		var s = sin(17*time + control.getSpeed());
	}

	dibujar(matPadre){
		this.cuerpo.dibujar(matPadre);
	}

}