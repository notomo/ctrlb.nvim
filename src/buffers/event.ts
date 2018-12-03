import { EventRepository } from "../repository/event";
import { ChildProcess } from "child_process";

export class EventRegisterer {
  protected readonly receivers: ChildProcess[] = [];

  constructor(protected readonly eventRepository: EventRepository) {}

  public async subscribe(process: ChildProcess) {
    this.receivers.push(process);
  }

  public async unsubscribe() {
    this.receivers
      .filter(p => {
        return !p.killed;
      })
      .map(p => {
        p.kill();
      });
    this.receivers.length = 0;
  }
}
