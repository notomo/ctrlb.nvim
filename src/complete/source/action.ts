import { ApiInfoRepository } from "../../repository/apiInfo";

export class Action {
  constructor(protected readonly apiInfoRepository: ApiInfoRepository) {}

  public async get(actionName: string): Promise<string[]> {
    const apiInfos = await this.apiInfoRepository.get();

    return apiInfos.map(action => {
      return action.name;
    });
  }
}
