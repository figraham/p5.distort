/**
 * Creates a Distort controller. Keeps track of frames and the distort factor.
 * Also provides a streamlined way to render all elements associated with the controller.
 * 
 * @module controller
 * @class Distort
 */
class Distort {

  /**
   * @constructor 
   * @param {Number} distortFactor 
   * @param {Number} framesPerCycle 
   */
  constructor(distortFactor, framesPerCycle) {
    this.distortFactor = distortFactor;
    this.framesPerCycle = framesPerCycle;
    this.currentFrame = 0;
    this.elements = [];
    console.log("p5.distort Started - v0.0.1 - open source p5.js vertex manipulation library created by Fi Graham");
  }

  /**
   * Returns a float value between 0 and 1 that represents the current location in the frameCycle.
   * 
   * @method currentTime
   */
  currentTime() {
    return map(this.currentFrame, 0, this.framesPerCycle, 0, 1);
  }

  /**
   * Adds an element to the controller. Calling this method directly may result in problems.
   * This will be done automatically when a DistortElement is created.
   * If an Element is already been created it's controller should be changed using the changeController() method in DistortElement.
   * 
   * @method addElement
   * @param {DistortElement} element 
   */
  addElement(element) {
    this.elements.push(element);
  }

  /**
   * Will update frame and all DistortElements under the controller.
   * 
   * @method update
   */
  update() {
    for (let i = 0; i < this.elements.length; i++) {
      this.elements[i].update();
    }
    this.currentFrame++;
  }

  /**
   * Renders all DistortElements under this controller.
   * 
   * @method render
   */
  render() {
    for (let i = 0; i < this.elements.length; i++) {
      this.elements[i].render();
    }
  }

  /**
   * Returns an index for the element. -1 if not in controller.
   * 
   * @method elementIndex
   * @param {DistortElement} element 
   */
  elementIndex(element) {
    for (let i = 0; i < this.elements.length; i++) {
      if (this.elements[i] === element) {
        return i;
      }
    }
    return -1;
  }

}