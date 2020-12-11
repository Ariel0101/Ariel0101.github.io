function Helicoptero(){
	var accionar = false
	$("body").keydown(function(e){
		switch(e.key){
			case "h":
				accionar = true;
				break;               
		}
	});
	this.anguloEstatico = 0;
	this.anguloVariable = 0;

	this.control = new ControlHelicoptero();

	var controlFormaCuerpo = [
							   [vec3.fromValues(-0.15, -0.045, 0),
							    vec3.fromValues(-0.184, 0.0396, 0),
							    vec3.fromValues(0.063, 0.07137, 0),
							    vec3.fromValues(0.1, 0.045, 0)],

							   [vec3.fromValues(0.1, 0.045, 0),
							    vec3.fromValues(0.192, -0.06705, 0),
							    vec3.fromValues(-0.121, -0.12267, 0),
							    vec3.fromValues(-0.15, -0.045, 0)]
							 ]
	
	var formaCuerpo = new CurvaMultiple(controlFormaCuerpo, 2); 

	var controlRecorridoZ = [vec3.fromValues(0, 0, -0.07),
							 vec3.fromValues(0, 0, -0.035),
							 vec3.fromValues(0, 0, 0.035),
							 vec3.fromValues(0, 0, 0.07)
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
	var supCuerpo = new SuperficieBarrido(formaCuerpo, recorridoZ, escaladoCuerpo);

	this.cuerpo = new Objeto3D(supCuerpo, 50, 50, [215/255, 211/255, 186/255]);

	var heliceDD = new HeliceDerecha();
	heliceDD.setEscala(1.4, 1.4, 1.4);
	heliceDD.setPosicion(0.05, 0.045, 0.061);
	this.heliceDD = heliceDD;
	this.cuerpo.agregarHijo(heliceDD);

	var heliceDT = new HeliceDerecha();
	heliceDT.setEscala(1.4, 1.4, 1.4);
	heliceDT.setPosicion(-0.05, 0.045, 0.061);
	this.heliceDT = heliceDT;
	this.cuerpo.agregarHijo(heliceDT);

	var heliceID = new HeliceIzquierda();
	heliceID.setEscala(1.4, 1.4, 1.4);
	heliceID.setPosicion(0.05, 0.045, -0.061);
	this.heliceID = heliceID;
	this.cuerpo.agregarHijo(heliceID);

	var heliceIT = new HeliceIzquierda();
	heliceIT.setEscala(1.4, 1.4, 1.4);
	heliceIT.setPosicion(-0.05, 0.045, -0.061);
	this.heliceIT = heliceIT;
	this.cuerpo.agregarHijo(heliceIT);

	var pieD = new PatinDeAterrizaje();
	pieD.setPosicion(0.02, -0.06, 0.05);
	pieD.setRotacion(-PI/5, 0, 0);

	this.cuerpo.agregarHijo(pieD);

	var pieI = new PatinDeAterrizaje();
	pieI.setPosicion(0.02, -0.06, -0.05);
	pieI.setRotacion(PI/5, 0, 0);

	this.cuerpo.agregarHijo(pieI);

	var cola = new Cola();
	cola.setPosicion(-0.1, 0, 0);
	cola.setRotacion(0, 0, -PI/9);

	this.cola = cola;
	this.cuerpo.agregarHijo(cola);


	this.actualizar = function(){
		if (accionar){
			if (this.anguloEstatico == 0){
				//Subir helice
				this.anguloVariable += PI/64;
				this.heliceDD.setRotacion(-this.anguloVariable, 0, 0);
				this.heliceDT.setRotacion(-this.anguloVariable, 0, 0);
				this.heliceID.setRotacion(PI+this.anguloVariable, 0, 0);
				this.heliceIT.setRotacion(PI+this.anguloVariable, 0, 0);
				if (this.anguloVariable >= PI/2){
					this.anguloEstatico = PI/2;
					this.anguloVariable = PI/2;
					accionar = false;
				}
			} else if (this.anguloEstatico == PI/2) {
				//Bajar helice
				this.anguloVariable -= PI/64;
				this.heliceDD.setRotacion(-this.anguloVariable, 0, 0);
				this.heliceDT.setRotacion(-this.anguloVariable, 0, 0);
				this.heliceID.setRotacion(PI+this.anguloVariable, 0, 0);
				this.heliceIT.setRotacion(PI+this.anguloVariable, 0, 0);
				if (this.anguloVariable <= 0){
					this.anguloEstatico = 0;
					this.anguloVariable = 0
					accionar = false;
				}
			}
		}
		if (this.anguloEstatico == PI/2){
			return;
		}
		this.control.update();
		var pos = this.control.getPosition();
		var rotX = this.control.getRoll();
		var rotY = this.control.getYaw();
		var rotZ = this.control.getPitch();

		this.cuerpo.setPosicion(pos.x, pos.y, pos.z);
		this.cuerpo.setRotacion(rotX, rotY, rotZ);

		this.heliceDD.actualizar(this.control);
		this.heliceDT.actualizar(this.control);
		this.heliceID.actualizar(this.control);
		this.heliceIT.actualizar(this.control);

		this.cola.actualizar(this.control);


	}

	this.dibujar = function(matPadre){
		this.cuerpo.dibujar(matPadre);
	}

	this.getPosition = function(){
		return this.control.getPosition();
	}

	this.getYaw = function(){
		return this.control.getYaw();
	}

	this.getPitch = function(){
		return this.control.getPitch();
	}

	this.getRoll = function(){
		return this.control.getRoll();
	}

	this.setEscala = function(x, y, z) {
		this.cuerpo.setEscala(x, y, z);
	}


}


class HeliceDerecha {

	constructor(){

		//-----------------------------------------Rotor-------------------------------
		var m0 = 0.01*0.552284749831;
		var controlFormaCirculo =
		[
			[vec3.fromValues(0.01, 0, 0),
			 vec3.fromValues(0.01, m0, 0),
			 vec3.fromValues(m0, 0.01, 0),
			 vec3.fromValues(0, 0.01, 0)
			],
			[vec3.fromValues(0, 0.01, 0),
			 vec3.fromValues(-m0, 0.01, 0),
			 vec3.fromValues(-0.01, m0, 0),
			 vec3.fromValues(-0.01, 0, 0)
			],
			[vec3.fromValues(-0.01, 0, 0),
			 vec3.fromValues(-0.01, -m0, 0),
			 vec3.fromValues(-m0, -0.01, 0),
			 vec3.fromValues(0, -0.01, 0)
			],
			[vec3.fromValues(0, -0.01, 0),
			 vec3.fromValues(m0, -0.01, 0),
			 vec3.fromValues(0.01, -m0, 0),
			 vec3.fromValues(0.01, 0, 0)
			]

		];

		var formaCirculo = new CurvaMultiple(controlFormaCirculo, 4);

		var controlRecorridoX = [vec3.fromValues(-0.015, 0, 0),
								 vec3.fromValues(-0.0075, 0, 0),
								 vec3.fromValues(0.0075, 0, 0),
								 vec3.fromValues(0.015, 0, 0)
								]

		var recorridoX = new BezierCubic(controlRecorridoX);

		var cilindro = new SuperficieBarrido(formaCirculo, recorridoX, escaladoTapas);

		this.rotor = new Objeto3D(cilindro, 20, 20, [43/255, 45/255, 47/255]);

		//------------------------------------Brazo------------------------------------
		var m1 = 0.00666*magia;
		var m2 = 0.01*magia;
		var controlFormaElipse =
		[
			[vec3.fromValues(0.01, 0, 0),
			 vec3.fromValues(0.01, m1/2, 0),
			 vec3.fromValues(m2, 0.00666, 0),
			 vec3.fromValues(0, 0.00666, 0)
			],
			[vec3.fromValues(0, 0.00666, 0),
			 vec3.fromValues(-m2, 0.00666, 0),
			 vec3.fromValues(-0.01, m1/2, 0),
			 vec3.fromValues(-0.01, 0, 0)
			],
			[vec3.fromValues(-0.01, 0, 0),
			 vec3.fromValues(-0.01, -m1/2, 0),
			 vec3.fromValues(-m2, -0.00666, 0),
			 vec3.fromValues(0, -0.00666, 0)
			],
			[vec3.fromValues(0, -0.00666, 0),
			 vec3.fromValues(m2, -0.006666, 0),
			 vec3.fromValues(0.01, -m1/2, 0),
			 vec3.fromValues(0.01, 0, 0)
			]
		];

		var formaElipse = new CurvaMultiple(controlFormaElipse, 4);

		var controlRecorridoZ0 = [vec3.fromValues(0, 0, 0),
								 vec3.fromValues(0, 0, 0.025),
								 vec3.fromValues(0, 0, 0.05),
								 vec3.fromValues(0, 0, 0.075)
								]

		var recorridoZ0 = new BezierCubic(controlRecorridoZ0);

		var escaladoLineal = function(v){
			var a = 1 - 0.5*v;
			return [a, a, a];
		}

		var seccionCono = new SuperficieBarrido(formaElipse, recorridoZ0, escaladoLineal);
		var brazo = new Objeto3D(seccionCono, 20, 20, [87/255, 89/255, 93/255]);

		this.rotor.agregarHijo(brazo);

		//---------------------------------Aro-----------------------------------------
		var m3 = 0.002*magia;

		var controlFormaO =
		[
			[vec3.fromValues(0.002, 0.002, 0),
			 vec3.fromValues(0.002, m3 + 0.002, 0),
			 vec3.fromValues(m3, 0.004, 0),
			 vec3.fromValues(0, 0.004, 0)
			],
			[vec3.fromValues(0, 0.004, 0),
			 vec3.fromValues(-m3, 0.004, 0),
			 vec3.fromValues(-0.002, m3 + 0.002, 0),
			 vec3.fromValues(-0.002, 0.002, 0)
			],
			[vec3.fromValues(-0.002, 0.002, 0),
			 vec3.fromValues(-0.002, 0.000666, 0),
			 vec3.fromValues(-0.002, -0.000666, 0),
			 vec3.fromValues(-0.002, -0.002, 0),
			],
			[vec3.fromValues(-0.002, -0.002, 0),
			 vec3.fromValues(-0.002, -m3 - 0.002, 0),
			 vec3.fromValues(-m3, -0.004, 0),
			 vec3.fromValues(0, -0.004, 0)
			],
			[vec3.fromValues(0, -0.004, 0),
			 vec3.fromValues(m3, -0.004, 0),
			 vec3.fromValues(0.002, -m3 - 0.002, 0),
			 vec3.fromValues(0.002, -0.002, 0)
			],
			[vec3.fromValues(0.002, -0.002, 0),
			 vec3.fromValues(0.002, -0.000666, 0),
			 vec3.fromValues(0.002, 0.000666, 0),
			 vec3.fromValues(0.002, 0.002, 0),
			]

		];

		var formaO = new CurvaMultiple(controlFormaO, 6);

		var m4 = 0.02*magia;

		var controlRecorridoCirculo =
		[
			[vec3.fromValues(0, 0, 0.02),
			 vec3.fromValues(m4, 0, 0.02),
			 vec3.fromValues(0.02, 0, m4),
			 vec3.fromValues(0.02, 0, 0)
			],
			[vec3.fromValues(0.02, 0, 0),
			 vec3.fromValues(0.02, 0, -m4),
			 vec3.fromValues(m4, 0, -0.02),
			 vec3.fromValues(0, 0, -0.02)
			],
			[vec3.fromValues(0, 0, -0.02),
			 vec3.fromValues(-m4, 0, -0.02),
			 vec3.fromValues(-0.02, 0, -m4),
			 vec3.fromValues(-0.02, 0, 0)
			],
			[vec3.fromValues(-0.02, 0, 0),
			 vec3.fromValues(-0.02, 0, m4),
			 vec3.fromValues(-m4, 0, 0.02),
			 vec3.fromValues(0, 0, 0.02)
			]

		];

		var recorridoCirculo = new CurvaMultiple(controlRecorridoCirculo, 4);

		var toroEliptico = new SuperficieBarrido(formaO, recorridoCirculo);

		var aro = new Objeto3D(toroEliptico, 20, 20, [151/255, 21/255, 0/255]);

		aro.setPosicion(0, 0, 0.075 + 0.02);
		brazo.agregarHijo(aro);

		this.aro = aro;

		//----------------------------------Eje----------------------------------------
		var m4 = 0.003*magia;

		var controlFormaCirculo1 =
		[
			[vec3.fromValues(0.003, 0, 0),
			 vec3.fromValues(0.003, m4, 0),
			 vec3.fromValues(m4, 0.003, 0),
			 vec3.fromValues(0, 0.003, 0)
			],
			[vec3.fromValues(0, 0.003, 0),
			 vec3.fromValues(-m4, 0.003, 0),
			 vec3.fromValues(-0.003, m4, 0),
			 vec3.fromValues(-0.003, 0, 0)
			],
			[vec3.fromValues(-0.003, 0, 0),
			 vec3.fromValues(-0.003, -m4, 0),
			 vec3.fromValues(-m4, -0.003, 0),
			 vec3.fromValues(0, -0.003, 0)
			],
			[vec3.fromValues(0, -0.003, 0),
			 vec3.fromValues(m4, -0.003, 0),
			 vec3.fromValues(0.003, -m4, 0),
			 vec3.fromValues(0.003, 0, 0)
			]

		];

		var formaCirculo1 = new CurvaMultiple(controlFormaCirculo1, 4);

		var controlRecorridoY =
		[vec3.fromValues(0, -0.0032, 0),
		 vec3.fromValues(0, -0.0010656, 0),
		 vec3.fromValues(0, 0.0010656, 0),
		 vec3.fromValues(0, 0.0032, 0)
		]

		var recorridoY = new BezierCubic(controlRecorridoY);

		var cilindro1 = new SuperficieBarrido(formaCirculo1, recorridoY, escaladoTapas);

		var eje = new Objeto3D(cilindro1, 20, 20, [43/255, 45/255, 47/255]);

		//eje.setEscala(0.003, 0.16, 0.003);
		aro.agregarHijo(eje);

		this.eje = eje;

		//------------------------------Aspas------------------------------------------

		var controlFormaLineal =
		[vec3.fromValues(-0.002, -0.002, 0),
		 vec3.fromValues(0, -0.000666, 0),
		 vec3.fromValues(0, 0.000666, 0),
		 vec3.fromValues(0.002, 0.002, 0)
		];

		var formaLineal = new BezierCubic(controlFormaLineal);

		var controlRecorridoZ1 = 
		[vec3.fromValues(0, 0, 0),
		 vec3.fromValues(0, 0, 0.00545),
		 vec3.fromValues(0, 0, 0.011),
		 vec3.fromValues(0, 0, 0.0165),
		];

		var recorridoZ1 = new BezierCubic(controlRecorridoZ1);

		var poligono = new SuperficieBarrido(formaLineal, recorridoZ1);

		var cantAspas = 10;
		for (var i = 0; i < cantAspas; i++){
			var aspa = new Objeto3D(poligono, 3, 3, [87/255, 89/255, 93/255]);
			aspa.setRotacion(0, 2*i*PI/cantAspas, 0);
			eje.agregarHijo(aspa);
		}

	}

	setRotacion(x, y, z){
		this.rotor.setRotacion(x, y, z);
	}

	setPosicion(x, y, z){
		this.rotor.setPosicion(x, y, z);
	}

	setEscala(dx, dy, dz){
		this.rotor.setEscala(dx, dy, dz);
	}

	rotarAro(x, y, z){
		this.aro.setRotacion(x, y, z);
	}

	rotarEje(alpha){
		this.eje.setRotacion(0, alpha, 0);
	}

	actualizar(control){
		var v = control.getSpeed();
		this.rotarAro(0, 0, -20*v);
		this.rotarEje(time*PI*3);
	}

	dibujar(matPadre){
		this.rotor.dibujar(matPadre);
	}

}

class HeliceIzquierda {
	constructor(){
		var helice = new HeliceDerecha();
		helice.setRotacion(PI, 0, 0);
		this.helice = helice;
	}

	setRotacion(x, y, z){
		this.helice.setRotacion(x, y, z);
	}

	setPosicion(x, y, z){
		this.helice.setPosicion(x, y, z);
	}

	setEscala(dx, dy, dz){
		this.helice.setEscala(dx, dy, dz);
	}

	actualizar(control){
		var v = control.getSpeed();
		this.helice.rotarAro(0, 0, 20*v);
		this.helice.rotarEje(time*PI*3);
	}

	dibujar(matPadre){
		this.helice.dibujar(matPadre);
	}
}

class PatinDeAterrizaje {

	constructor(){

		this.centro = new Objeto3D();

		var m1 = 0.002*magia;

		var controlFormaCirculo =
		[
			[vec3.fromValues(0.002, 0, 0),
			 vec3.fromValues(0.002, m1, 0),
			 vec3.fromValues(m1, 0.002, 0),
			 vec3.fromValues(0, 0.002, 0)
			],
			[vec3.fromValues(0, 0.002, 0),
			 vec3.fromValues(-m1, 0.002, 0),
			 vec3.fromValues(-0.002, m1, 0),
			 vec3.fromValues(-0.002, 0, 0)
			],
			[vec3.fromValues(-0.002, 0, 0),
			 vec3.fromValues(-0.002, -m1, 0),
			 vec3.fromValues(-m1, -0.002, 0),
			 vec3.fromValues(0, -0.002, 0)
			],
			[vec3.fromValues(0, -0.002, 0),
			 vec3.fromValues(m1, -0.002, 0),
			 vec3.fromValues(0.002, -m1, 0),
			 vec3.fromValues(0.002, 0, 0)
			]

		];

		var formaCirculo = new CurvaMultiple(controlFormaCirculo, 4);

		var escala = 0.2;

		var controlRecorridoY0 =
		[vec3.fromValues(0, 0, 0),
		 vec3.fromValues(0, -0.05*escala, 0),
		 vec3.fromValues(0, -0.1*escala, 0),
		 vec3.fromValues(0, -0.15*escala, 0)
		];

		var recorridoY0 = new BezierCubic(controlRecorridoY0);

		var cilindro = new SuperficieBarrido(formaCirculo, recorridoY0);

		var tuboD = new Objeto3D(cilindro, 20, 20, [0, 0, 0]);
	
		tuboD.setPosicion(0.05, 0, 0);

		this.centro.agregarHijo(tuboD);

		var tuboT = new Objeto3D(cilindro, 20, 20, [0, 0, 0]);
	
		tuboT.setPosicion(-0.05, 0, 0);

		this.centro.agregarHijo(tuboT);

		var controlRecorridoPie =
		[
			[vec3.fromValues(-0.16, 0.02, 0),
			 vec3.fromValues(-0.15, 0, 0),
			 vec3.fromValues(-0.1, 0, 0),
			 vec3.fromValues(0, 0, 0)
			],
			[vec3.fromValues(0, 0, 0),
			 vec3.fromValues(0.1, 0, 0),
			 vec3.fromValues(0.15, 0, 0),
			 vec3.fromValues(0.16, 0.02, 0)
			]
		];

		var recorridoPie = new CurvaMultiple(controlRecorridoPie, 2);

		var cilindroCurvo = new SuperficieBarrido(formaCirculo, recorridoPie, escaladoTapas);

		var pie = new Objeto3D(cilindroCurvo, 50, 20, [0, 0, 0]);

		pie.setPosicion(0, -0.15*escala, 0);

		this.centro.agregarHijo(pie);


	}

	setRotacion(x, y, z){
		this.centro.setRotacion(x, y, z);
	}

	setPosicion(x, y, z){
		this.centro.setPosicion(x, y, z);
	}

	setEscala(dx, dy, dz){
		this.centro.setEscala(dx, dy, dz);
	}

	dibujar(matPadre){
		this.centro.dibujar(matPadre);
	}

}

class Cola {

	constructor(){

		this.centro = new Objeto3D();

		var e1 = 0.03;

		var controlFormaRectangulo =
		[
			[vec3.fromValues(0.4*e1, 0.1*e1, 0),
			 vec3.fromValues(0.4*e1, 0.0333*e1, 0),
			 vec3.fromValues(0.4*e1, -0.0333*e1, 0),
			 vec3.fromValues(0.4*e1, -0.1*e1, 0)
			],
			[vec3.fromValues(0.4*e1, -0.1*e1, 0),
			 vec3.fromValues(0.1333*e1, -0.1*e1, 0),
			 vec3.fromValues(-0.1333*e1, -0.1*e1, 0),
			 vec3.fromValues(-0.4*e1, -0.1*e1, 0)
			],
			[vec3.fromValues(-0.4*e1, -0.1*e1, 0),
			 vec3.fromValues(-0.4*e1, -0.0333*e1, 0),
			 vec3.fromValues(-0.4*e1, 0.0333*e1, 0),
			 vec3.fromValues(-0.4*e1, 0.1*e1, 0)
			],
			[vec3.fromValues(-0.4*e1, 0.1*e1, 0),
			 vec3.fromValues(-0.1333*e1, 0.1*e1, 0),
			 vec3.fromValues(0.1333*e1, 0.1*e1, 0),
			 vec3.fromValues(0.4*e1, 0.1*e1, 0)
			]
		];

		var formaRectangulo = new CurvaMultiple(controlFormaRectangulo, 4);

		var controlRecorridomX =
		[vec3.fromValues(0, 0, 0),
		 vec3.fromValues(-0.075, 0, 0),
		 vec3.fromValues(-0.15, 0, 0),
		 vec3.fromValues(-0.225, 0, 0)
		];

		var recorridomX = new BezierCubic(controlRecorridomX);

		var escalaCaja = function(v){
			var a = 1.5 - 1.2*v;
			return [a, 1, 1];
		}
		var supCaja = new SuperficieBarrido(formaRectangulo, recorridomX, escalaCaja);

		var canioD = new Objeto3D(supCaja, 20, 20, [215/255, 211/255, 186/255]);

		canioD.setPosicion(0, 0, 0.02);
		this.centro.agregarHijo(canioD);

		var canioI = new Objeto3D(supCaja, 20, 20, [215/255, 211/255, 186/255]);

		canioI.setPosicion(0, 0, -0.02);
		this.centro.agregarHijo(canioI);

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

		var controlRecorridoZ =
		[vec3.fromValues(0, 0, -1),
		 vec3.fromValues(0, 0, -0.333),
		 vec3.fromValues(0, 0, 0.333),
		 vec3.fromValues(0, 0, 1),
		];

		var recorridoZ = new BezierCubic(controlRecorridoZ);

		var cilindro = new SuperficieBarrido(formaCirculo, recorridoZ);

		var semieje = new Objeto3D(cilindro, 20, 20, [43/255, 45/255, 47/255]);

		semieje.setEscala(0.006, 0.006, 0.04);
		semieje.setPosicion(-0.225, 0, 0);

		this.centro.agregarHijo(semieje);

		var e2 = 0.04;
		var controlFormaCaja =
		[
			[vec3.fromValues(1*e2, 1*e2, 0),
			 vec3.fromValues(0.666*e2, 1*e2, 0),
			 vec3.fromValues(0.333*e2, 1*e2, 0),
			 vec3.fromValues(0, 1*e2, 0)
			],
			[vec3.fromValues(0, 1*e2, 0),
			 vec3.fromValues(-0.3333*e2, 0.3333*e2, 0),
			 vec3.fromValues(-0.6666*e2, -0.3333*e2, 0),
			 vec3.fromValues(-1*e2, -1*e2, 0)
			],
			[vec3.fromValues(-1*e2, -1*e2, 0),
			 vec3.fromValues(-0.666*e2, -1*e2, 0),
			 vec3.fromValues(-0.333*e2, -1*e2, 0),
			 vec3.fromValues(0, -1*e2, 0)
			],
			[vec3.fromValues(0, -1*e2, 0),
			 vec3.fromValues(0.3333*e2, -0.3333*e2, 0),
			 vec3.fromValues(0.6666*e2, 0.3333*e2, 0),
			 vec3.fromValues(1*e2, 1*e2, 0)
			]
		];

		var formaCaja = new CurvaMultiple(controlFormaCaja, 4);

		var controlRecorridoCorto =
		[vec3.fromValues(0, 0, -0.001),
		 vec3.fromValues(0, 0, -0.000333),
		 vec3.fromValues(0, 0, 0.000333),
		 vec3.fromValues(0, 0, 0.001)
		];

		var recorridoCorto = new BezierCubic(controlRecorridoCorto);

		var supPlato = new SuperficieBarrido(formaCaja, recorridoCorto, escaladoTapas);

		var aletaD = new Objeto3D(supPlato, 20, 20, [151/255, 21/255, 0/255]);
		aletaD.setPosicion(-0.225, 0, 0.04);
		this.aletaD = aletaD;
		this.centro.agregarHijo(aletaD);

		var aletaI = new Objeto3D(supPlato, 20, 20, [151/255, 21/255, 0/255]);
		aletaI.setPosicion(-0.225, 0, -0.04);
		this.aletaI = aletaI;
		this.centro.agregarHijo(aletaI);



	}

	setRotacion(x, y, z){
		this.centro.setRotacion(x, y, z);
	}

	setPosicion(x, y, z){
		this.centro.setPosicion(x, y, z);
	}

	setEscala(dx, dy, dz){
		this.centro.setEscala(dx, dy, dz);
	}

	actualizar(control){
		var rotY = control.getRoll();
		this.aletaI.setRotacion(0, 2*rotY, 0);
		this.aletaD.setRotacion(0, 2*rotY, 0);
	}

	dibujar(matPadre){
		this.centro.dibujar(matPadre);
	}

}
/*
var magia = 0.552284749831;
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

var escaladoTapas = function(v){
	if (v == 0 || v == 1){
		return [0, 0, 0];
	}
	return [1, 1, 1];
};

var cilindro = new SuperficieBarrido(formaCirculo, recorridoX, escaladoTapas);

var rotor = new Objeto3D(cilindro, 20, 20, [1,1,1]);
rotor.setEscala(0.015, 0.01, 0.01);
rotor.setPosicion(0, 0.045, 0.061);
*/

/*
var controlFormaElipse =
[
	[vec3.fromValues(1, 0, 0),
	 vec3.fromValues(1, magia/2, 0),
	 vec3.fromValues(magia, 1, 0),
	 vec3.fromValues(0, 1, 0)
	],
	[vec3.fromValues(0, 1, 0),
	 vec3.fromValues(-magia, 1, 0),
	 vec3.fromValues(-1, magia/2, 0),
	 vec3.fromValues(-1, 0, 0)
	],
	[vec3.fromValues(-1, 0, 0),
	 vec3.fromValues(-1, -magia/2, 0),
	 vec3.fromValues(-magia, -1, 0),
	 vec3.fromValues(0, -1, 0)
	],
	[vec3.fromValues(0, -1, 0),
	 vec3.fromValues(magia, -1, 0),
	 vec3.fromValues(1, -magia/2, 0),
	 vec3.fromValues(1, 0, 0)
	]

];

var formaElipse = new CurvaMultiple(controlFormaElipse, 4);

var controlRecorridoZ0 = [vec3.fromValues(0, 0, 0),
						 vec3.fromValues(0, 0, 0.5),
						 vec3.fromValues(0, 0, 1),
						 vec3.fromValues(0, 0, 1.5)
						]

var recorridoZ0 = new BezierCubic(controlRecorridoZ0);

var escaladoLineal = function(v){
	var a = 1 - 0.5*v;
	return [a, a, a];
}

var seccionCono = new SuperficieBarrido(formaElipse, recorridoZ0, escaladoLineal);
var brazo = new Objeto3D(seccionCono, 20, 20, [1,1,1]);
brazo.setEscala(0.01, 0.00666, 0.05);
brazo.setPosicion(0, 0.045, 0.061);
*/