import { Requester } from "../requester";
import { TabRepository } from "./tab";
import { HistoryRepository } from "./history";

describe("HistoryRepository", () => {
  let historyRepository: HistoryRepository;
  let open: jest.Mock;
  let tabOpen: jest.Mock;

  beforeEach(() => {
    const RequesterClass: jest.Mock<Requester> = jest.fn(() => ({})) as any;
    const requester = new RequesterClass();

    open = jest.fn();
    tabOpen = jest.fn();
    const TabRepositoryClass: jest.Mock<TabRepository> = jest.fn(() => ({
      open: open,
      tabOpen: tabOpen,
    })) as any;
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
