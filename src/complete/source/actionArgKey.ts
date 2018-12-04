import { ApiInfoRepository } from "../../repository/apiInfo";

export class ActionArgKey {
  constructor(protected readonly apiInfoRepository: ApiInfoRepository) {}

  public async get(actionName: string): Promise<ReadonlyArray<string>> {
    const [apiInfos, error] = await this.apiInfoRepository.get();

    if (error !== null) {
      return [];
    }

    const params = apiInfos
      .filter(action => action.name === actionName)
      .map(action => action.params);

    if (params.length !== 1) {
      return [];
    }

    return params[0].map(param => "-" + param.name + "=");
  }
}
