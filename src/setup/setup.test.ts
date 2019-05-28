import { setupServerClient } from "./setup";

describe("setupServerClient", () => {
  let mkdir: jest.Mock;
  let chmod: jest.Mock;
  let stat: jest.Mock;
  let unarchive: jest.Mock;
  let writeFile: jest.Mock;
  let getFile: jest.Mock;
  let log: jest.Mock;
  let errorLog: jest.Mock;

  const binaryDirectory = "bin";
  const releaseTag = "v0.0.1";
  const linux = "linux";

  const noError = null;
  const response200 = { statusCode: 200, statusMessage: "OK" };
  const response404 = { statusCode: 404, statusMessage: "Not Found" };
  const body = "body";

  beforeEach(() => {
    mkdir = jest.fn();
    chmod = jest.fn();
    stat = jest.fn().mockImplementation(() => {
      throw new Error("ENOENT: no such file or directory");
    });
    writeFile = jest.fn();

    getFile = jest.fn().mockImplementation((url, callback) => {
      callback(noError, response200, body);
    });

    unarchive = jest
      .fn()
      .mockImplementation((zipFilePath, binaryDirectory, callback) => {
        callback();
      });

    log = jest.fn();
    errorLog = jest.fn();
  });

  it("win32", () => {
    setupServerClient(
      "win32",
      releaseTag,
      binaryDirectory,
      mkdir,
      chmod,
      stat,
      unarchive,
      writeFile,
      getFile,
      log,
      errorLog
    );

    expect(mkdir).toHaveBeenCalledWith(binaryDirectory);
    expect(writeFile).toHaveBeenCalledWith(
      binaryDirectory + `/wsxhub-windows-amd64-${releaseTag}.zip`,
      body
    );
    expect(chmod).toHaveBeenCalledWith(binaryDirectory + "/wsxhub.exe", "0744");
    expect(chmod).toHaveBeenCalledWith(
      binaryDirectory + "/wsxhubd.exe",
      "0744"
    );
  });

  it("linux", () => {
    setupServerClient(
      linux,
      releaseTag,
      binaryDirectory,
      mkdir,
      chmod,
      stat,
      unarchive,
      writeFile,
      getFile,
      log,
      errorLog
    );

    expect(mkdir).toHaveBeenCalledWith(binaryDirectory);
    expect(writeFile).toHaveBeenCalledWith(
      binaryDirectory + `/wsxhub-linux-amd64-${releaseTag}.zip`,
      body
    );
    expect(chmod).toHaveBeenCalledWith(binaryDirectory + "/wsxhub", "0744");
    expect(chmod).toHaveBeenCalledWith(binaryDirectory + "/wsxhubd", "0744");
  });

  it("darwin", () => {
    setupServerClient(
      "darwin",
      releaseTag,
      binaryDirectory,
      mkdir,
      chmod,
      stat,
      unarchive,
      writeFile,
      getFile,
      log,
      errorLog
    );

    expect(mkdir).toHaveBeenCalledWith(binaryDirectory);
    expect(writeFile).toHaveBeenCalledWith(
      binaryDirectory + `/wsxhub-darwin-amd64-${releaseTag}.zip`,
      body
    );
    expect(chmod).toHaveBeenCalledWith(binaryDirectory + "/wsxhub", "0744");
    expect(chmod).toHaveBeenCalledWith(binaryDirectory + "/wsxhubd", "0744");
  });

  it("the other platform", () => {
    const otherPlatform = "the other platform";
    expect(() => {
      setupServerClient(
        otherPlatform,
        releaseTag,
        binaryDirectory,
        mkdir,
        chmod,
        stat,
        unarchive,
        writeFile,
        getFile,
        log,
        errorLog
      );
    }).toThrowError("Not supported: " + otherPlatform);
  });

  it("The zip file is not written when the response is 404", () => {
    const getFileWith404 = jest.fn().mockImplementation((url, callback) => {
      callback(noError, response404, body);
    });

    setupServerClient(
      linux,
      releaseTag,
      binaryDirectory,
      mkdir,
      chmod,
      stat,
      unarchive,
      writeFile,
      getFileWith404,
      log,
      errorLog
    );

    expect(writeFile).not.toHaveBeenCalled();
  });

  it("The zip file is not written when the response is error", () => {
    const error = "error";
    const getFileWithError = jest.fn().mockImplementation((url, callback) => {
      callback(error, response200, body);
    });

    setupServerClient(
      linux,
      releaseTag,
      binaryDirectory,
      mkdir,
      chmod,
      stat,
      unarchive,
      writeFile,
      getFileWithError,
      log,
      errorLog
    );

    expect(writeFile).not.toHaveBeenCalled();
    expect(errorLog).toHaveBeenCalledWith(error);
  });

  it("do nothing if the zip file already exists", () => {
    stat = jest.fn();

    setupServerClient(
      "win32",
      releaseTag,
      binaryDirectory,
      mkdir,
      chmod,
      stat,
      unarchive,
      writeFile,
      getFile,
      log,
      errorLog
    );

    expect(getFile).not.toHaveBeenCalled();
  });
});
