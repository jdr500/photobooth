var capture;
var currentFilter = new camFilter();
var screenshots = [];
var oldpos = 0;
var newpos = 0;
var oldend = 640;
var left, right, space;

function preload() {
  left = loadImage('assets/left.png');
  right = loadImage('assets/right.png');
  space = loadImage('assets/spacebar.png');
}

function setup() {
  pixelDensity(1);
  createCanvas(640, 600);
  capture = createCapture(VIDEO);
  capture.hide();
  capture.size(640, 480);
  noStroke();
  background(255);
  
}

function draw() {
  
  currentFilter.display();
  displayScreenshots();
  
}




function mousePressed() {
  currentFilter.state = 1;
}

function camFilter() {
  this.on = 1; // 1 means that live video feed is playing, 
               // 0 means we're checking the screenshots
  this.state = 0; // 0 is Normal Video Feed, 1 is Pointilism
  this.shape = {
    type: "rect",
    size: 10
  };
  this.color = "normal";
  this.opacity;
  this.display = function() {
    console.log("display");
    if(this.state === 0) {
      normalVideoFeed(this.color);
    } else {
      background(255);
      shapeVideoFeed(this.color,this.shape);
    }
  }
}

function normalVideoFeed(colors) {
  background(255);
  loadPixels();
  capture.loadPixels();
  if (capture.pixels.length > 0) {
    // console.log(capture.width + ", "+ capture.height);
    // console.log(capture.pixels.length);
    var skip = 1;
    // if (mouseY < 480) {
    //   skip = int(map(mouseX, 0, width, 1, 10));
    // } else {
    //   skip = 1;
    // }
    for (var y = 0; y < capture.height; y += skip) {
      for (var x = 0; x < capture.width; x += skip) {
        // y * width offsets our x value
        // to the right row of x's
        // 
        // we have to multiply the value
        // by 4 because every pixel has 
        // index[0] = R, [1] = G,
        // index[2] = B, [3] = A
        var end = capture.pixels.length;
        var index2 = end - (x + capture.width * capture.height - y * capture.width) * 4 - 4;
        var index = (x + y * capture.width) * 4;
        
        var r = capture.pixels[index2 + 0];
        var g = capture.pixels[index2 + 1];
        var b = capture.pixels[index2 + 2];
        
        if (colors == 'normal') {
          // don't do anything, rgb is fine
        } else if (colors == 'xray') {
          // do 255 - r, 255 - g, 255 - b
          r = 255 - r;
          g = 255 - g;
          b = 255 - b;
        } else if (colors == 'grayscale') {
          r = (r+g+b)/3;
          g = r;
          b = r;
        }
        
        pixels[index + 0] = r;
        pixels[index + 1] = g;
        pixels[index + 2] = b;
        pixels[index + 3] = 255;
      }
    }
    updatePixels();
  }
}

//shape is a shape object with 2 properties = type, size
function shapeVideoFeed(colors, shape) {
  // expose the pixel array in our video stream
  capture.loadPixels();

  // make sure we have a valid frame of video by ensuring that there is data
  // in this array
  if (capture.pixels.length > 0) {

    console.log(capture.width + ", " + capture.height);
    console.log(capture.pixels.length);

    // iterate over the pixel array
    for (var x = 0; x < capture.width; x += shape.size) {
      for (var y = 0; y < capture.height; y += shape.size) {

        // compute the location in our array (the array is a one dimensional array
        // that contains 4 slots per pixel - R,G,B,A)
        var loc = (y * capture.width + x) * 4;

        // extract the colors here
        var r = capture.pixels[loc];
        var g = capture.pixels[loc+1];
        var b = capture.pixels[loc+2];


        // draw an ellipse using this color
        fill(r, g, b);
        
        if(shape.type == "ellipse") {
          ellipse(capture.width - x - (.5 * shape.size), y + (.5 * shape.size), shape.size, shape.size);
        } else if(shape.type == "rect") {
          rectMode(CENTER);
          rect(capture.width - x - (.5 * shape.size), y + (.5 * shape.size), shape.size, shape.size);
        }
      }
    }
  }
}

function displayScreenshots() {
  // broke down this function into two parts:
  // 1. the scrolling through the thumbnails
  // 2. displaying the photos as thumbnails
  // 
  // we might need an extra part to display
  // the thumbnails on the screen if
  // they are clicked

  // this is the scrolling part
  // it checks the old left pos
  // and the old right pos to
  // align the translate() func
  // with the variable newpos

  // it has a variable speed
  // named shiftspeed
  var shiftspeed = 20;
  if (mouseY > 480) {
    if (mouseX < 40) {
      if (oldpos > 0) {
        newpos += shiftspeed;
        oldpos -= shiftspeed;
        oldend -= shiftspeed;
      }
    }
    if (mouseX > 600) {
      if (screenshots.length * 160 > oldend) {
        newpos -= shiftspeed;
        oldpos += shiftspeed;
        oldend += shiftspeed;
      }
    }
    console.log('screen is at: ' + oldpos + ', ' + oldend);
  }

  // this is the second part 
  // of the display function
  // 
  // it displays photos and 
  // cursors on the screen
  // 
  if (screenshots.length < 1) {
    push();
    imageMode(CENTER);
    image(space, 320, 540, 250, 75);
    pop();
  }
  if (screenshots.length > 0) {
    push();
    translate(newpos, 0);
    for (var i = 0; i < screenshots.length; i++) {
      image(screenshots[screenshots.length-1-i].shot, i * 160, 480, 160, 120);
    }
    pop();
    push();
    imageMode(CENTER);
    image(left, 30, 540, 40, 40);
    image(right, 610, 540, 40, 40);
    pop();
  }
}

function keyTyped() {
  if (keyCode == 32) {
    // copy what's on the canvas
    var shot = get(0, 0, 640, 480);
    var screenshot = new Screenshot(shot);
  
    // push it to the screenshots array
    screenshots.push(screenshot);
  }
  if (key === 's') {
    // save something
    save(screenshots[screenshots.length-1].shot, 'myImage.png');
  }
}

function Screenshot(shot) {
  this.shot = shot;
  
  // let's set up some hovered functions here
  this.clicked = false;
  this.hovered = false;
}
