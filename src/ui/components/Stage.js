export class Stage {
  ready
  done
  update
  stage

  static validateProperties (stage = new Stage()) {
    if (!(stage instanceof Stage)) throw new TypeError('Object must be instance of Stage')
    let flag = false
    for (const key of Object.keys(stage)) {
      if (stage[key] === 'stage') continue
      if (typeof stage[key] !== 'function') flag = key
    }

    stage.stage instanceof window.HTMLElement ? flag = false : flag = true

    if (flag) throw new TypeError(`${flag} must be a function`)
  }
}
