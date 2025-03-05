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

 /**
  * A digit made of individual pixels, written with a 3x5 fixed width font
  */
 class PixelDigit3x5 extends Shape {
    static width = 3;
    static height = 5;
    //bitmask for digits 0 to 9 on a 3x5 fixed width font
    static mask = new Array(10);
    static {
        this.mask[0] = [1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1];
        this.mask[1] = [0, 1, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1];
    }
    constructor(x, y, digit, rgba) {
        super(x, y);
        this.digit = digit;
        
        if(!Array.isArray(rgba) || rgba.length != 4){
            throw new Error("rgba needs to be an array with 4 elements, one for r,g,b,a");
        }
        this.rgba = rgba;

        const pixelCount = PixelDigit3x5.width * PixelDigit3x5.height;
        const bytes = 4 * pixelCount;
        const d = new Uint8ClampedArray(bytes);
        for(let pixel = 0, byte = 0; pixel < pixelCount; ++pixel, byte = pixel * 4){
            if(!!PixelDigit3x5.mask[digit][pixel]){
                d[byte] = rgba[0];
                d[byte + 1] = rgba[1];
                d[byte + 2] = rgba[2];
                d[byte + 3] = rgba[3];
            }else{
                d[byte] = 0;
                d[byte + 1] = 0;
                d[byte + 2] = 0;
                d[byte + 3] = 0;
            }
        }
        this.data = d;
    }
    draw(ctx){
        ctx.putImageData(new ImageData(this.data, PixelDigit3x5.width, PixelDigit3x5.height), this.x, this.y);
    }
 }

//(new Pixel(20,20,[255,0,0,255])).draw(context);
new TestShape(10,10).draw(context);
new PixelDigit3x5(30,30,0,[255,0,0,255]).draw(context);
new PixelDigit3x5(40,40,1,[0,255,0,255]).draw(context)