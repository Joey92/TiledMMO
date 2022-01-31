export default class Timer {
  private originalMs: number;
  private ms: number;
  constructor(ms: number) {
    this.ms = ms;
    this.originalMs = ms;
  }

  update(diff: number) {
    this.ms -= diff;
  }

  passed() {
    return this.ms < 0;
  }

  reset() {
    this.ms = this.originalMs;
  }

  setNewTime(ms: number) {
    this.originalMs = ms;
    this.ms = ms;
  }
}
