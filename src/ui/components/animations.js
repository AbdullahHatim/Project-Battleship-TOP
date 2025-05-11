/**
 * Starts or restarts the CSS animation on the given element.
 * If the animation has already completed, it will reset and play from the beginning.
 * @param {HTMLElement} element - The DOM element with a CSS animation applied.
 */
function startAnimation (element) {
  // Store animation properties before resetting
  const originalAnimation = element.style.animation

  // Remove the animation temporarily
  element.style.animation = 'none'

  // Trigger reflow to reset the animation
  void element.offsetWidth

  // Re-apply the stored animation and start it
  element.style.animation = originalAnimation
  element.style.animationPlayState = 'running'
}

/**
 * Pauses the CSS animation on the given element.
 * @param {HTMLElement} element - The DOM element with a CSS animation applied.
 */
function pauseAnimation (element) {
  element.style.animationPlayState = 'paused'
}

/**
 * Checks the current play state of the CSS animation on the given element.
 * @param {HTMLElement} element - The DOM element with a CSS animation applied.
 * @returns {string} The current animation play state: "running" or "paused".
 */
function checkAnimationState (element) {
  return getComputedStyle(element).animationPlayState
}

/**
 * Convenience wrapper to check if the animation is currently running.
 * @param {HTMLElement} element - The DOM element with a CSS animation applied.
 * @returns {boolean} True if animation is running, false otherwise.
 */
function isAnimationRunning (element) {
  return checkAnimationState(element) === 'running'
}

/**
 * Returns a Promise that resolves when the animation starts.
 * @param {HTMLElement} element - The DOM element to monitor.
 * @returns {Promise} Resolves once the animationstart event is fired.
 */
function onAnimationStart (element) {
  return new Promise((resolve) => {
    const onAnimStart = (event) => {
      element.removeEventListener('animationstart', onAnimStart)
      resolve(event)
    }
    element.addEventListener('animationstart', onAnimStart)
  })
}

/**
 * Returns a Promise that resolves when the animation ends.
 * @param {HTMLElement} element - The DOM element to monitor.
 * @returns {Promise} Resolves once the animationend event is fired.
 */
function onAnimationEnd (element) {
  return new Promise((resolve) => {
    const onAnimEnd = (event) => {
      element.removeEventListener('animationend', onAnimEnd)
      resolve(event)
    }
    element.addEventListener('animationend', onAnimEnd)
  })
}

async function onAnimation (element) {
  startAnimation(element)
  await onAnimationEnd(element)
  pauseAnimation(element)
}

// async function wait (ms) {
//   await new Promise()
// }

// Exporting all functions as named exports
export {
  startAnimation,
  pauseAnimation,
  checkAnimationState,
  isAnimationRunning,
  onAnimationStart,
  onAnimationEnd,
  onAnimation
}
