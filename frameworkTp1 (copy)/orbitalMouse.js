
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

        // Con esto roto la camara si tengo el mouse apretado, divido por 5 para que gire mas despacio
        if(mouseDown){
            rotarCamaraY = rotarCamaraY + (x - mouseX);
            rotarCamaraX = rotarCamaraX + (y - mouseY);  
        }

        // Esto limita la camara para que no se de vuelta
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