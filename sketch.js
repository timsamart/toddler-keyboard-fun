let colorDrops = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(255);
  pixelDensity(1); // Ensures consistency across devices
}

function draw() {
  colorDrops.forEach((drop) => {
    drop.spread();
    drop.show();
  });
}

function keyPressed() {
  if (key === "Enter") {
    background(255); // Resets the canvas
    colorDrops = []; // Clears existing drops
  } else {
    let newColor = color(random(255), random(255), random(255), 100);
    let newDrop = new ColorDrop(
      random(width),
      random(height),
      newColor,
      random(100)
    );
    colorDrops.push(newDrop);
  }
}

class ColorDrop {
  constructor(x, y, color, size) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.size = size;
    this.spreading = true;
  }

  spread() {
    if (this.spreading) {
      this.size += 0.5; // Control the rate of spread
      if (this.size > 50) {
        // Set a limit to the spread
        this.spreading = false;
      }
    }
  }

  show() {
    noStroke();
    fill(this.color);
    ellipse(this.x, this.y, this.size);
  }
}
