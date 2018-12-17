import { Requester } from "../requester";
import { TabRepository } from "./tab";
import { HistoryRepository } from "./history";

describe("HistoryRepository", () => {
  let historyRepository: HistoryRepository;
  let open: jest.Mock;
  let tabOpen: jest.Mock;

  beforeEach(() => {
    const RequesterClass = jest.fn<Requester>(() => ({}));
    const requester = new RequesterClass();

    open = jest.fn();
    tabOpen = jest.fn();
    const TabRepositoryClass = jest.fn<TabRepository>(() => ({
      open: open,
      tabOpen: tabOpen,
    }));
    const tabRepository = new TabRepositoryClass();

    historyRepository = new HistoryRepository(requester, tabRepository);
  });

  it("open", async () => {
    await historyRepository.open("url");

    expect(open).toHaveBeenCalledWith("url");
  });

  it("tabOpen", async () => {
    await historyRepository.tabOpen("url");

    expect(tabOpen).toHaveBeenCalledWith("url");
  });
});
