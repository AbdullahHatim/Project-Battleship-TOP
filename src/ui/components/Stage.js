export class Stage {
  name
  ready
  done
  isDone
  finishUp
  update
  stage
  doneButton

  static validateProperties (stage = new Stage()) {
    if (!(stage instanceof Stage)) throw new TypeError('Object must be instance of Stage')
    let flag = false
    for (const key of Object.keys(stage)) {
      if (key === 'stage' || key === 'doneButton' || key === 'name') continue
      if (typeof stage[key] !== 'function') flag = key
    }
    if (flag) throw new TypeError(`${flag} must be a function`)

    stage.stage instanceof window.HTMLElement ? flag = false : flag = 'stage'
    stage.doneButton instanceof window.HTMLElement ? flag = false : flag = 'doneButton'
    if (flag) throw new TypeError(`${flag} must be a a DOM element`)
    typeof stage.name === 'string' ? flag = false : flag = 'name'
    if (flag) throw new TypeError(`${flag} must be a a String`)
  }
}
