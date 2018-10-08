import { ApiInfoRepository } from "../../repository/apiInfo";

export class ActionName {
  constructor(protected readonly apiInfoRepository: ApiInfoRepository) {}

  public async get(actionGroupName: string): Promise<string[]> {
    const apiInfo = await this.apiInfoRepository.get();

    const actionGroup = apiInfo.actionGroups.find(actionGroup => {
      return actionGroup.name === actionGroupName;
    });

    if (actionGroup === undefined) {
      return [];
    }

    return actionGroup.actions.map(action => {
      return action.name;
    });
  }
}
