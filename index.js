const canvas = document.querySelector("canvas#art");
const context = canvas.getContext("2d");
//context.fillStyle = "green";
// Add a rectangle at (10, 10) with size 100x100 pixels
// context.fillRect(0, 0, canvas.width, canvas.height);

class Shape {
    constructor() {
       if(this.constructor == Shape) {
          throw new Error("Class is of abstract type and can't be instantiated");
       };
    //    if(this.draw == undefined) {
    //        throw new Error("draw method must be implemented");
    //    };
       if(this.getPixelWidth == undefined) {
           throw new Error("getPixelWidth method must be implemented");
       };
       if(this.getPixelHeight == undefined) {
           throw new Error("getPixelHeight field must be implemented");
       };
    }
    draw(ctx, x, y){
        ctx.putImageData(new ImageData(this.data, this.getPixelWidth(), this.getPixelHeight()), x, y);
    }
    getByteCount(){
        return 4 * this.getPixelWidth() * this.getPixelHeight();
    }
 }

 class Colour {
    constructor(r, g, b, a){
        this.bytes = new Uint8ClampedArray(4);
        this.bytes[0] = r;
        this.bytes[1] = g;
        this.bytes[2] = b;
        this.bytes[3] = a;
    }
    static TRANSPARENT = new Colour(0, 0, 0, 0);
    static RED = new Colour(255, 0, 0, 255);
    static PURPLE = new Colour(255, 210, 0, 255);
 }

 class NegativeSpace {
    static bytes = Colour.TRANSPARENT.bytes;
    static nPixels(n){
        const bs = new Uint8ClampedArray(4 * n);
        for(let i=0; i<n; ++i){
            bs.set(this.bytes, i*4);
        }
        return bs;
    }
 }

 class Pixel extends Shape {
    static width = 1;
    static height = 1;
    constructor(colour){
        super();
        if(!(colour instanceof Colour)){
            throw new Error("colour needs to be an rgba colour");
        }
        this.data = colour.bytes;
    }
    getPixelWidth(){
        return Pixel.width;
    }
    getPixelHeight(){
        return Pixel.height;
    }
 }

 class TestShape extends Shape{
    static width = 10;
    static height = 10;
    constructor(){
        super();
        const d = new Uint8ClampedArray(this.getByteCount());
        for(let i = d.length-1; i >= 3; i=i-4){
            d.set(Colour.PURPLE.bytes, i);
        }
        this.data = d;
    }
    getPixelWidth(){
        return TestShape.width;
    }
    getPixelHeight(){
        return TestShape.height;
    }
 }

 
 /**
  * A digit made of individual subelement, written with a 3x5 fixed width font
  */
 class Digit3x5 extends Shape {
    static width = 3;
    static height = 5;

    //bitmask for digits 0 to 9 on a 3x5 fixed width font
    static mask = new Array(10);
    static {
        this.mask[0] = [1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1];
        this.mask[1] = [0, 1, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1];
        this.mask[2] = [0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 1];
        this.mask[3] = [1, 1, 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 1, 1];
        this.mask[4] = [1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1];
        this.mask[5] = [1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0];
        this.mask[6] = [1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1];
        this.mask[7] = [1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1];
        this.mask[8] = [1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1];
        this.mask[9] = [1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1];
    }

    constructor(digit) {
        super();

        if(!Number.isInteger(digit) || digit < 0 || digit > 9){
            throw new Error("digit needs to be a number between 0 an 9 includive");
        }
        this.digit = digit;
    }
 }

 class PixelDigit3x5 extends Digit3x5 {
    static width = super.width;
    static height = super.height;
    static pixelCount = Digit3x5.width * Digit3x5.height;

    constructor(digit, colour) {
        super(digit);

        if(!(colour instanceof Colour)){
            throw new Error("colour needs to be an rgba colour");
        }
        this.colour = colour;

        const d = new Uint8ClampedArray(this.getByteCount());
        for(let pixel = 0, byte = 0; pixel < PixelDigit3x5.pixelCount; ++pixel, byte = pixel * 4){
            if(!!Digit3x5.mask[digit][pixel]){
                d.set(colour.bytes, byte);
            }else{
                d.set(NegativeSpace.bytes, byte);
            }
        }
        this.data = d;
    }

    getPixelWidth(){
        return PixelDigit3x5.width;
    }

    getPixelHeight(){
        return PixelDigit3x5.height;
    }
 }

 class CompoundDigit3x5 extends Digit3x5 {
    static pixelCount = super.pixelCount;
    static hPadding = 2;
    static vPadding = 2;

    constructor(digit, shapes) {
        super(digit);
        this.shapes = shapes;
    
        const d = new Uint8ClampedArray(this.getByteCount());

        //pointer at where we're currently writing in our data
        let byte = 0; 
        //reference sub-shape. this is why all shapes need to be the same size
        let shape = shapes[0];
        const shapePixelHeight = shape.getPixelHeight();
        const shapePixelWidth = shape.getPixelWidth();
        const bytesPerShape = shapePixelHeight * shapePixelWidth * 4;
        const bytesPerLine = shapePixelWidth * 4;
        //a line of negative space as wide as an individual sub-shape
        const negativeLine = NegativeSpace.nPixels(shapePixelWidth);

        //how many sub-shape wide is this compound shape?
        for(let row = 0, shapeNo=0; row < Digit3x5.height; ++row){

            //how many sub-shape high is this compound shape?
            for(let column = 0; column < Digit3x5.width; ++column, shapeNo=row*Digit3x5.width+column){
                //the source-sub shape we're writing in our own buffer
                shape = this.shapes[shapeNo];

                //copy bytes line by line in the correct position of the destination
                for(let h = 0; h < shapePixelHeight; ++h){
                    byte = row * Digit3x5.width * bytesPerShape //entire rows of shapes aleady written
                            + h * Digit3x5.width * bytesPerLine //entire rows of pixes already written on the current line
                            + column * bytesPerLine; //the number of columns already skipped
                    //need to check if this sub-shape actually needs to be rendered
                    if(!!Digit3x5.mask[digit][shapeNo]){
                        d.set(shape.data.subarray(h*shapePixelWidth*4, (h+1)*shapePixelWidth*4), byte);
                    }else{
                        d.set(negativeLine, byte);
                    }
                }
            }    
        }

        // for(let h = 0; h < shapePixelHeight; ++h){
        //     byte = 0 * Digit3x5.width * bytesPerShape //entire rows of shapes aleady written
        //             + h * Digit3x5.width * bytesPerLine //entire rows of pixes already written on the current line
        //             + 0 * bytesPerLine; //the number of columns already skipped
        //     //need to check if this sub-shape actually needs to be rendered
        //     d.set(shape.data.subarray(h*shapePixelWidth*4, (h+1)*shapePixelWidth*4), byte);
        // }

        this.data = d;
    }
    getPixelWidth(){
        //each shape is repliced horizontally for Digit3x5.width and in between each instance there is hPadding
        return Digit3x5.width * this.shapes[0].getPixelWidth();// + (Digit3x5.width - 1) * CompoundDigit3x5.hPadding;
    }
    getPixelHeight(){
        //each shape is repliced vertically for Digit3x5.width and in between each instance there is hPadding
        return Digit3x5.height * this.shapes[0].getPixelHeight();// + (Digit3x5.height - 1) * CompoundDigit3x5.vPadding ;
    }
 }

//(new Pixel(20,20,[255,0,0,255])).draw(context);
//new TestShape(10,10).draw(context);
for(let i=0; i<10; ++i){
    new PixelDigit3x5(i, Colour.RED).draw(context, i*10, i*10);
}

const shapes = [];
for(let i=0; i<15; ++i){ shapes[i] = new PixelDigit3x5(2, Colour.RED); }
new CompoundDigit3x5(2, shapes).draw(context, 110, 110);