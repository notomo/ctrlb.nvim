import { Requester } from "../requester";
import { NullableError } from "../error";

export class EventRepository {
  constructor(protected readonly requester: Requester) {}

  public async subscribe(eventName: string): Promise<NullableError> {
    return this.requester.executeAsync({
      method: "event/subscribe",
      params: { eventName: eventName },
    });
  }

  public async unsubscribe(eventName: string): Promise<NullableError> {
    return this.requester.executeAsync({
      method: "event/unsubscribe",
      params: { eventName: eventName },
    });
  }
}
