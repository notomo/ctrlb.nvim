import { ApiInfoRepository } from "../../repository/apiInfo";

export class Action {
  constructor(protected readonly apiInfoRepository: ApiInfoRepository) {}

  public async get(actionName: string): Promise<ReadonlyArray<string>> {
    const [apiInfos, error] = await this.apiInfoRepository.get();

    if (error !== null) {
      return [];
    }

    return apiInfos.map(action => {
      return action.name;
    });
  }
}
