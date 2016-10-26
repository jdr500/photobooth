var capture;

var tempW = 10;

function setup() {
  createCanvas(640, 600);
  capture = createCapture(VIDEO);
  capture.hide();
  noStroke();
  background(0);
}

function draw() {
  // expose the pixel array in our video stream
  capture.loadPixels();
  
  // make sure we have a valid frame of video by ensuring that there is data
  // in this array
  if (capture.pixels.length > 0) {

    console.log(capture.width + ", " + capture.height);
    console.log(capture.pixels.length);
    
    // iterate over the pixel array
    for (var x = 0; x < capture.width; x += tempW) {
      for (var y = 0; y < capture.height; y += tempW) {

        // compute the location in our array (the array is a one dimensional array
        // that contains 4 slots per pixel - R,G,B,A)
        var loc = (y * capture.width + x) * 4;
        
        // extract the colors here
        var r = capture.pixels[loc];
        var g = capture.pixels[loc+1];
        var b = capture.pixels[loc+2];

        // draw an ellipse using this color
        fill(r, g, b);
        ellipse(capture.width - x - (.5 * tempW), y + (.5 * tempW), tempW, tempW);
      }
    }
  }
}