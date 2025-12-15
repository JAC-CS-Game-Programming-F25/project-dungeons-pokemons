export default class Move {
  constructor(name, definition) {
    this.name = name;
    this.type = definition.type;
    this.basePower = definition.basePower;
  }
}
