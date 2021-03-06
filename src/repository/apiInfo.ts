import { Requester } from "../requester";
import { WithError } from "../error";

interface ApiInfo {
  name: string;
  params: { name: string }[];
}

export class ApiInfoRepository {
  constructor(protected readonly requester: Requester) {}

  public async get(): Promise<WithError<ReadonlyArray<ApiInfo>>> {
    const [apiInfos, error] = await this.requester.execute<ApiInfo[]>({
      method: "apiInfo/get",
    });

    if (apiInfos === null) {
      return [[], error];
    }

    return [apiInfos, error];
  }
}
