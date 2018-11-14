import { Requester } from "../requester";
import { ChildProcess } from "child_process";

export class EventRepository {
  constructor(protected readonly requester: Requester) {}

  public async subscribe(eventName: string): Promise<ChildProcess> {
    return this.requester.executeAsync({
      method: "event/subscribe",
      params: { eventName: eventName },
    });
  }

  public async unsubscribe(eventName: string): Promise<ChildProcess> {
    return this.requester.executeAsync({
      method: "event/unsubscribe",
      params: { eventName: eventName },
    });
  }
}
