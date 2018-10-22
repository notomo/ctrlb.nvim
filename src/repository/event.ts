import { Requester } from "../requester";
import { ChildProcess } from "child_process";

export class EventRepository {
  constructor(protected readonly requester: Requester) {}

  public async subscribe(eventName: string): Promise<ChildProcess> {
    return this.requester.executeAsync({
      actionGroupName: "event",
      actionName: "subscribe",
      args: { eventName: eventName },
    });
  }

  public async unsubscribe(eventName: string): Promise<ChildProcess> {
    return this.requester.executeAsync({
      actionGroupName: "event",
      actionName: "unsubscribe",
      args: { eventName: eventName },
    });
  }
}
