import { Requester } from "../requester";

interface ApiInfo {
  name: string;
}

export class ApiInfoRepository {
  constructor(protected readonly requester: Requester) {}

  public get(): Promise<ApiInfo[]> {
    return this.requester.execute<ApiInfo[]>({
      method: "apiInfo/get",
    });
  }
}
