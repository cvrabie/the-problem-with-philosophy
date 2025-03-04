const canvas = document.querySelector("canvas#art");
const context = canvas.getContext("2d");
//context.fillStyle = "green";
// Add a rectangle at (10, 10) with size 100x100 pixels
// context.fillRect(0, 0, canvas.width, canvas.height);

class Shape {
    constructor(x, y) {
       if(this.constructor == Shape) {
          throw new Error("Class is of abstract type and can't be instantiated");
       };
       if(this.draw == undefined) {
           throw new Error("draw method must be implemented");
       };
       this.x = x;
       this.y = y;
    }
 }

 class Pixel extends Shape{
    constructor(x, y, rgba){
        super(x,y);
        if(!Array.isArray(rgba) || rgba.length != 4){
            throw new Error("rgba needs to be an array with 4 elements, one for r,g,b,a");
        }
        this.data = new Uint8ClampedArray(rgba);
    }
    draw(ctx){
        ctx.putImageData(new ImageData(this.data, 1, 1), this.x, this.y);
    }
 }

 class TestShape extends Shape{
    constructor(x, y){
        super(x,y);
        const d = new Uint8ClampedArray(4*10*10);
        for(let i = d.length-1; i >= 3; i=i-4){
            d[i] = 255;
            d[i-1] = 210;
            d[i-2] = 0;
            d[i-3] = 190;
        }
        this.data = d;
    }
    draw(ctx){
        ctx.putImageData(new ImageData(this.data, 10, 10), this.x, this.y);
    }
 }

//(new Pixel(20,20,[255,0,0,255])).draw(context);
(new TestShape(10,10)).draw(context);