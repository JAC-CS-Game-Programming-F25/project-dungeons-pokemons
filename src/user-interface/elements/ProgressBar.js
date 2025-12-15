import { context } from "../../globals.js";

export default class ProgressBar {
  /**
   * A progress bar UI element that displays a colored bar
   * representing a current value relative to a maximum value.
   *
   * @param {number} x X position
   * @param {number} y Y position
   * @param {number} width Width of the bar
   * @param {number} height Height of the bar
   * @param {number} currentValue Current value
   * @param {number} maxValue Maximum value
   * @param {string} color Color of the filled portion
   * @param {string} backgroundColor Color of the empty portion
   */
  constructor(
    x,
    y,
    width,
    height,
    currentValue,
    maxValue,
    color = "green",
    backgroundColor = "#d0d0d0"
  ) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.backgroundColor = backgroundColor;
    this.currentValue = currentValue;
    this.maxValue = maxValue;
    this.displayValue = currentValue; // Initialize to current value, not 0
  }

  /**
   * Sets the current and maximum values for the progress bar.
   *
   * @param {number} current Current value
   * @param {number} max Maximum value
   */
  setValue(current, max) {
    this.currentValue = current;
    this.maxValue = max;
    // Don't update displayValue here - let tweening handle it
  }

  /**
   * Updates the display value (used for tweening).
   *
   * @param {number} value The value to display
   */
  setDisplayValue(value) {
    this.displayValue = value;
  }

  /**
   * Sets the color of the filled portion of the bar.
   *
   * @param {string} color Color string (e.g., "red", "#ff0000")
   */
  setColor(color) {
    this.color = color;
  }

  /**
   * Renders the progress bar.
   */
  render() {
    context.save();

    // Draw background (empty portion)
    context.fillStyle = this.backgroundColor;
    context.fillRect(this.x, this.y, this.width, this.height);

    // Draw border
    context.strokeStyle = "#000000";
    context.lineWidth = 1;
    context.strokeRect(this.x, this.y, this.width, this.height);

    // Calculate filled width based on display value
    const percentage = Math.max(
      0,
      Math.min(1, this.displayValue / this.maxValue)
    );
    const filledWidth = this.width * percentage;

    // Draw filled portion
    if (filledWidth > 0) {
      context.fillStyle = this.color;
      context.fillRect(this.x, this.y, filledWidth, this.height);
    }

    context.restore();
  }

  /**
   * Gets the current percentage (0-1).
   *
   * @returns {number} Percentage value between 0 and 1
   */
  getPercentage() {
    return this.displayValue / this.maxValue;
  }
}
