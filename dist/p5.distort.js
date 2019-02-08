class Distort {

  constructor(distortFactor, framesPerCycle) {
    this.distortFactor = distortFactor;
    this.framesPerCycle = framesPerCycle;
    this.currentFrame = 0;
    this.elements = [];
  }

  addElement(element) {
    this.elements.push(element);
  }

  update() {
    for (let i = 0; i < this.elements.length; i++) {
      this.elements[i].update();
    }
    this.currentFrame++;
  }

  render() {
    for (let i = 0; i < this.elements.length; i++) {
      this.elements[i].render();
    }
  }

}
class DistortElement {

  constructor(controller, position, size) {
    this.setController(controller);
    this.position = position;
    this.size = size;
    this.offset = 0;

    this.controller;
    this.pointGroups = [];
    this.bounds = [];
  }

  setController(controller) {
    this.controller = controller;
    this.controller.addElement(this);
  }

  sectionSize() {
    return this.size / 3.0;
  }

  updateOffset() {
    this.offset = map(this.controller.currentFrame, 0, this.controller.framesPerCycle, 0, this.sectionSize());
  }

  /**
   * Update
   * 
   * Method that will update all variables necessary to advance the frame.
   */
  update() {
    this.updateOffset();
  }

  /**
   * Render
   * 
   * In it's current state this will render an element to a p5 canvas transforming the points to distort the shape.
   */
  render() {
    this.drawingTraits();
    beginShape();
    for (let i = 0; i < this.pointGroups.length; i++) {
      if (i != 0) {
        beginContour();
      }
      for (let j = 0; j < this.pointGroups[i].length; j++) {
        let p = this.pointGroups[i][j];
        p = this.transformPoint(p);
        vertex(p.x, p.y);
      }
      if (i != 0) {
        endContour();
      }
    }
    endShape(CLOSE);
  }

  /**
   * Calculate Progress
   * 
   * Helper method for the transformPoint() method. Separate so it can be overridden or used in an overridden transformPoint() method.
   * 
   * @param {p5.Vector} point 
   */
  calculateProgress(point) {
    return map(point.x + this.offset % this.sectionSize(), 0, this.sectionSize(), 0, TWO_PI)
  }

  /**
   * Drawing Traits
   * 
   * The default black and white drawing traits for all elements. Can be overridden using the setDrawingTraits() method.
   */
  drawingTraits() {
    noStroke();
    fill(0);
  }

  /**
   * Set Drawing Traits
   * 
   * Takes one function as a parameter. The passed function should have no parameters and use set the stroke and fill.
   * It will be called at the beginning of the render() method.
   * 
   * @param {function} drawingTraitsFunction 
   */
  setDrawingTraits(drawingTraitsFunction) {
    this.drawingTraits = drawingTraitsFunction;
  }

  /**
   * Transform Point
   * 
   * This is a default transform point function but another one can be set using the setTransformPoint() method.
   * Return a new p5.Vector as not to effect the current state of the points being passed as a parameter.
   * 
   * @param {p5.Vector} point 
   */
  transformPoint(point) {
    let progress = this.calculateProgress(point);
    return createVector(point.x, point.y + map(sin(progress), -1, 1, - this.size / this.controller.distortFactor, this.size / this.controller.distortFactor));
  }

  /**
   * Set Transform Point
   * 
   * Will override how a point is transformed. Pass in a function that receives a p5.Vector and return a different p5.Vector.
   * 
   * @param {function} transformPointFunction 
   */
  setTransformPoint(transformPointFunction) {
    this.transformPoint = transformPointFunction;
  }

  scaledSize() {
    return this.size - 2 * (this.size / this.controller.distortFactor);
  }

  setPosition(position) {
    let difference = createVector(this.position.x - position.x, this.position.y - position.y);
    let newPointGroups = [];
    for (let i = 0; i < this.pointGroups.length; i++) {
      let points = [];
      for (let j = 0; j < this.pointGroups[i].length; j++) {
        points.push(createVector(this.pointGroups[i][j].x - difference.x, this.pointGroups[i][j].y - difference.y));
      }
      newPointGroups.push(points);
    }
    this.pointGroups = newPointGroups;
    this.position = position;
  }

}
class DistortCircle extends DistortElement {

  /**
   * 
   * @param {p5.Vector} position 
   * @param {number} size 
   * @param {number:int} detail 
   */
  constructor(controller, position, size, detail) {
    super(controller, position, size);
    this.generatePoints(detail);
  }

  generatePoints(detail) {
    let points = [];
    for (let i = 0; i < detail; i++) {
      let angle = map(i, 0, detail, 0, TWO_PI);
      let x = this.radius() * cos(angle);
      let y = this.radius() * sin(angle);
      points.push(createVector(x + this.position.x, y + this.position.y));
    }
    this.pointGroups.push(points);
  }

  radius() {
    return this.scaledSize() / 2;
  }

}
class DistortString extends DistortElement {

  constructor(controller, position, size, font, string) {
    super(controller, position, size);
    this.font = font;
    this.string = string;

    this.distanceThreshold = 3;

    this.generateBounds();
    this.generatePoints();

    this.setPosition(createVector(position.x, position.y)); // TODO make this more elegant
  }

  generatePoints() {
    let p5Points = this.font.textToPoints(
      this.string,
      (this.position.x - this.bounds.w / 2) - this.bounds.advance,
      this.position.y + this.bounds.h / 2,
      this.scaledSize(),
      {
        sampleFactor: 1,
        simplifyThreshold: 0,
      }
    );
    let points = [];
    if (p5Points.length > 0) {
      points.push(p5Points[0]);
    }
    for (let i = 1; i < p5Points.length; i++) {
      if (this.differentShape(p5Points, i)) {
        this.pointGroups.push(points);
        points = [];
      }
      points.push(p5Points[i]);
    }
    this.pointGroups.push(points);
  }

  distanceLog(logAll) {
    for (let i = 1; i < this.points.length; i++) {
      let distance = dist(this.points[i - 1].x, this.points[i - 1].y, this.points[i].x, this.points[i].y);
      if (logAll || distance > this.distanceThreshold) {
        console.log(distance);
      }
    }
  }

  differentShape(points, pointIndex) {
    if (pointIndex <= 0 || pointIndex > points.length - 1) {
      return false;
    } else {
      let distance = dist(points[pointIndex - 1].x, points[pointIndex - 1].y, points[pointIndex].x, points[pointIndex].y);
      return distance > this.distanceThreshold;
    }
  }

  generateBounds() {
    this.bounds = this.font.textBounds(this.string, this.position.x, this.position.y, this.scaledSize());
    this.position = createVector(this.position.x - ((this.bounds.x) / 2), this.position.y - (this.bounds.y / 2));
  }

}