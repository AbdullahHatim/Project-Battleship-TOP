export class Stage {
  async ready () {
    throw new Error('Must be overwritten')
  }
}
