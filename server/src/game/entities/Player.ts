import Session from "./Session";
import Unit, { UnitOpts } from "./Unit";

export default class Player extends Unit {
  private readonly session: Session;
  private charmed: boolean = false

  constructor(session: Session, opts?: UnitOpts) {
    super(opts);
    this.session = session;
    this.session.setPlayer(this);
  }

  getSession() {
    return this.session;
  }

  sendDirectMessage(data: Buffer | Uint8Array) {
    this.session.send(data);
    return this;
  }
}
