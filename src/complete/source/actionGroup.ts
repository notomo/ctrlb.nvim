import { ApiInfoRepository } from "../../repository/apiInfo";

export class ActionGroup {
  constructor(protected readonly apiInfoRepository: ApiInfoRepository) {}
  public async get(): Promise<string[]> {
    const apiInfo = await this.apiInfoRepository.get();

    return apiInfo.actionGroups.map(actionGroup => {
      return actionGroup.name;
    });
  }
}
