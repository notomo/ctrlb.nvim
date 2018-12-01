import { EventRepository } from "../repository/event";
import { ChildProcess } from "child_process";

export class EventRegisterer {
  protected readonly receivers: ChildProcess[] = [];
  protected readonly subscribedEvents: string[] = [];

  constructor(protected readonly eventRepository: EventRepository) {}

  public async subscribe(process: ChildProcess, ...eventNames: string[]) {
    for (const eventName of eventNames) {
      this.eventRepository.subscribe(eventName);
      this.subscribedEvents.push(eventName);
    }
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

    this.subscribedEvents.map(eventName => {
      this.eventRepository.unsubscribe(eventName);
    });
    this.subscribedEvents.length = 0;
  }
}
