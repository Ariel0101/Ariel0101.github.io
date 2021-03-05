class Helipuerto {


	constructor(dx, dy, dz){

		var base = new Objeto3D(new Plano(dx, dz), 5, 5, colorBase);
		base.setRotacion(0, PI/2, 0);
		base.initTexture("img/helipad.png");
		this.base = base;

		var pared1 = new Objeto3D(new Plano(dx, dy), 5, 5, colorHelipuerto);
		pared1.setRotacion(PI/2, 0, 0);
		pared1.setPosicion(0, -dy/2, dz/2);
		this.base.agregarHijo(pared1);

		var pared2 = new Objeto3D(new Plano(dx, dy), 5, 5, colorHelipuerto);
		pared2.setRotacion(PI/2, 0, 0);
		pared2.setPosicion(0, -dy/2, -dz/2);
		this.base.agregarHijo(pared2);

		var pared3 = new Objeto3D(new Plano(dy, dz), 5, 5, colorHelipuerto);
		pared3.setRotacion(0, 0, PI/2);
		pared3.setPosicion(dx/2, -dy/2, 0);
		this.base.agregarHijo(pared3);

		var pared4 = new Objeto3D(new Plano(dy, dz), 5, 5, colorHelipuerto);
		pared4.setRotacion(0, 0, PI/2);
		pared4.setPosicion(-dx/2, -dy/2, 0);
		this.base.agregarHijo(pared4);

	}

	setPosicion(x, y, z){
		this.base.setPosicion(x, y, z);
	}

	dibujar(matPadre){
		this.base.dibujar(matPadre);
	}


}