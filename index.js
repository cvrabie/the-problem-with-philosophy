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
    static CRIMSON = new Colour(220, 20, 60, 255);
    static DARK_RED = new Colour(139, 0, 0, 255);
    static BLUE = new Colour(0, 0, 255, 255);
    static DARK_BLUE = new Colour(0, 0, 139, 255);
    static GREEN = new Colour(0, 255, 0, 255);
    static PURPLE = new Colour(128, 0, 128, 255);
    static YELLOW = new Colour(255, 255, 0, 255);
    static DARK_YELLOW = new Colour(204, 204, 0, 255);
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
        for(let i = d.length-4; i >= 0; i=i-4){
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
    static hPadding = 5;
    static vPadding = 5;

    constructor(digit, shapePrototype, shapeFactory, negativeShapeFactory) {
        super(digit);
        this.shapes = [];
        for(let row = 0; row < Digit3x5.height; ++row){
            for(let column = 0; column < Digit3x5.width; ++column){
                //need to check if this sub-shape actually needs to be rendered
                if(!!Digit3x5.mask[digit][row*Digit3x5.width+column]){
                    this.shapes.push(shapeFactory(row, column))
                }else{
                    this.shapes.push(negativeShapeFactory(row, column))
                }
            }
        }
    
        const d = new Uint8ClampedArray(this.getByteCount());

        //pointer at where we're currently writing in our data
        let byte = 0; 
        
        //reference sub-shape. this is why all shapes need to be the same size
        let shape = shapePrototype;
        const shapePixelHeight = shape.getPixelHeight();
        const shapePixelWidth = shape.getPixelWidth();
        const bytesPerLine = shapePixelWidth * 4;
        //if(digit==7) console.log(shapePixelHeight, shapePixelWidth);

        //how many sub-shape wide is this compound shape?
        for(let row = 0; row < Digit3x5.height; ++row){

            //how many sub-shape high is this compound shape?
            for(let column = 0; column < Digit3x5.width; ++column){
                //the source-sub shape we're writing in our own buffer
                shape = this.shapes[row*Digit3x5.width+column];

                //copy bytes line by line in the correct position of the destination
                for(let h = 0; h < shapePixelHeight; ++h){
                            //entire rows of shapes aleady written
                    byte =  row * shapePixelHeight * Digit3x5.width * bytesPerLine
                            //horizontal padding in between shapes that were skipped
                            + row * shapePixelHeight * (Digit3x5.width - 1) * CompoundDigit3x5.hPadding * 4
                            
                            //vertical padding in between shapes
                            + row * Digit3x5.width * bytesPerLine * CompoundDigit3x5.vPadding 
                            //horizontal padding in between vertical padding
                            + row * (Digit3x5.width - 1) * CompoundDigit3x5.vPadding * CompoundDigit3x5.hPadding * 4
                            
                            //entire rows of pixes already written on the current line
                            + h * Digit3x5.width * bytesPerLine 
                            //horizontal padding in the rows of pixels already written on the current line
                            + h * (Digit3x5.width - 1) * CompoundDigit3x5.hPadding * 4

                            //the number of columns already skipped
                            + column * bytesPerLine
                            //horizonal padding on he columns already skipped
                            + column * CompoundDigit3x5.hPadding * 4;

                    d.set(shape.data.subarray(h*shapePixelWidth*4, (h+1)*shapePixelWidth*4), byte);
                    // if(digit==7) {
                    //     context.putImageData(new ImageData(d, this.getPixelWidth(), this.getPixelHeight()), 10, 10);
                    // }
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
        return Digit3x5.width * this.shapes[0].getPixelWidth() + (Digit3x5.width - 1) * CompoundDigit3x5.hPadding;
    }
    getPixelHeight(){
        //each shape is repliced vertically for Digit3x5.width and in between each instance there is hPadding
        return Digit3x5.height * this.shapes[0].getPixelHeight() + (Digit3x5.height - 1) * CompoundDigit3x5.vPadding ;
    }
 }

 class Rando{
    static next(){
        return Math.round(Math.random()*10)%10;
    }
 }

 function NumberArt(){
    //(new Pixel(20,20,[255,0,0,255])).draw(context);
    // new TestShape().draw(context, 10, 10);
    // for(let i=0; i<10; ++i){
    //     new PixelDigit3x5(i, Colour.RED).draw(context, i*10, i*10);
    // }
    console.log("NumberArt");
    const PositivePositive = () => new PixelDigit3x5(Rando.next(), Colour.CRIMSON);
    const PositiveNegative = () => new PixelDigit3x5(Rando.next(), Colour.DARK_YELLOW);
    const NegativeNegative = ()=>  new PixelDigit3x5(Rando.next(), Colour.BLUE);
    const NegativePositive = ()=>  new PixelDigit3x5(Rando.next(), Colour.GREEN);
    const L1Reference = PositivePositive();
    console.log(`L1: ${L1Reference.getPixelWidth()}x${L1Reference.getPixelHeight()}`);

    const Positive = () => new CompoundDigit3x5(1, L1Reference, PositivePositive, PositiveNegative);
    const Negative = () => new CompoundDigit3x5(1, L1Reference, NegativePositive, NegativeNegative);
    const L2Reference = Positive();
    console.log(`L2: ${L2Reference.getPixelWidth()}x${L2Reference.getPixelHeight()}`);

    const art = new CompoundDigit3x5(7, L2Reference, Positive, Negative);
    console.log(`L3: ${art.getPixelWidth()}x${art.getPixelHeight()}`);
    art.draw(context, 0, 0);
}
