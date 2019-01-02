import { RequestCallback } from "request";

export const setupServerClient = (
  processPlatform: string,
  releaseTag: string,
  binaryDirectory: string,
  mkdir: { (dir: string): void },
  chmod: { (path: string, mode: string): void },
  unarchive: {
    (filePath: string, extractTo: string, callback: Function): void;
  },
  writeFile: { (filePath: string, data: any): void },
  getFile: { (url: string, callback: RequestCallback): void }
) => {
  let platform: string;
  switch (processPlatform) {
    case "win32":
      platform = "windows";
      break;
    case "darwin":
      platform = "darwin";
      break;
    case "linux":
      platform = "linux";
      break;
    default:
      throw new Error("Not supported: " + processPlatform);
  }

  mkdir(binaryDirectory);

  const fileName = `wsxhub-${platform}-amd64-${releaseTag}.zip`;
  const url = `https://github.com/notomo/wsxhub/releases/download/${releaseTag}/${fileName}`;
  getFile(url, (error, response, body) => {
    if (error) {
      console.error(error);
      return;
    }

    console.log(`${url}: ${response.statusCode} ${response.statusMessage}`);
    if (response.statusCode === 200) {
      const zipFilePath = binaryDirectory + "/" + fileName;

      writeFile(zipFilePath, body);

      unarchive(zipFilePath, binaryDirectory, () => {
        const exe = platform === "windows" ? ".exe" : "";
        chmod(binaryDirectory + "/wsxhub" + exe, "0744");
        chmod(binaryDirectory + "/wsxhubd" + exe, "0744");
      });
    }
  });
};
