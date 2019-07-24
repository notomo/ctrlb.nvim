import { spawn, ChildProcess, execFile } from "child_process";
import { ActionInfo } from "./info";
import { Logger, getLogger } from "./logger";
import { Reporter } from "./reporter";
import { ConfigRepository } from "./repository/config";
import { WithError, NullableError } from "./error";

const promisifyProcess = (proc: ChildProcess) => {
  return new Promise((resolve, reject) => {
    proc.addListener("error", reject);
    proc.addListener("exit", (code: number) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject();
    });
  });
};

export class Requester {
  protected readonly logger: Logger;
  protected id = 0;

  constructor(
    protected readonly reporter: Reporter,
    protected readonly configRepository: ConfigRepository
  ) {
    this.logger = getLogger("requester");
  }

  public async batchNotify(infos: ActionInfo[]): Promise<NullableError> {
    if (infos.length === 0) {
      return null;
    }

    const client = await this.configRepository.getExecutableClient();
    const timeout = await this.configRepository.getTimeout();
    const port = await this.configRepository.getPort();
    const portOption = port === null ? [] : ["--port", String(port)];

    const proc = execFile(client, portOption.concat(["notify"]), {
      timeout: (timeout + 1) * 1000,
    });
    if (proc.stdin === null || proc.stderr === null) {
      return new Error("stdin or stderr not found");
    }

    let errorResult = "";
    proc.stderr.on("data", data => {
      errorResult += data;
    });

    proc.stdin.write(JSON.stringify(infos));
    proc.stdin.end();

    try {
      await promisifyProcess(proc);
    } catch (e) {
      const error = { name: "notify error", message: errorResult.trim() };
      await this.reporter.error(error);
      return error;
    }

    return null;
  }

  public async executeAsync(info: ActionInfo): Promise<NullableError> {
    const client = await this.configRepository.getExecutableClient();
    const timeout = await this.configRepository.getTimeout();
    const port = await this.configRepository.getPort();
    const portOption = port === null ? [] : ["--port", String(port)];

    this.id += 1;
    const id = String(this.id);
    const proc = execFile(
      client,
      portOption.concat([
        "send",
        "--timeout",
        String(timeout),
        "--filter",
        JSON.stringify({
          operator: "and",
          filters: [{ type: "contained", map: { id: id } }],
        }),
      ]),
      { timeout: (timeout + 1) * 1000 }
    );
    if (proc.stdin === null || proc.stdout === null || proc.stderr === null) {
      return new Error("stdin or stdout or stderr not found");
    }

    let result = "";
    proc.stdout.on("data", data => {
      result += data;
    });

    let errorResult = "";
    proc.stderr.on("data", data => {
      errorResult += data;
    });

    info.id = id;
    proc.stdin.write(JSON.stringify(info));
    proc.stdin.end();

    try {
      await promisifyProcess(proc);
    } catch (e) {
      const error = { name: "request error", message: errorResult.trim() };
      await this.reporter.error(error);
      return error;
    }

    const stdout: {
      error?: { data: { name: string }; message: string };
    } = JSON.parse(result.trim().split("\n")[0]);

    if (stdout.error !== undefined) {
      const error = {
        name: stdout.error.data.name,
        message: stdout.error.message,
      };
      await this.reporter.error(error);
      return error;
    }

    return null;
  }

  public async execute<T>(info: ActionInfo): Promise<WithError<T | null>> {
    const client = await this.configRepository.getExecutableClient();
    const timeout = await this.configRepository.getTimeout();
    const port = await this.configRepository.getPort();
    const portOption = port === null ? [] : ["--port", String(port)];

    this.id += 1;
    const id = String(this.id);
    const proc = execFile(
      client,
      portOption.concat([
        "send",
        "--timeout",
        String(timeout),
        "--filter",
        JSON.stringify({
          operator: "and",
          filters: [{ type: "contained", map: { id: id } }],
        }),
      ]),
      { timeout: (timeout + 1) * 1000 }
    );
    if (proc.stdin === null || proc.stdout === null || proc.stderr === null) {
      const e = new Error("stdin or stdout not found");
      return [null, e];
    }

    let result = "";
    proc.stdout.on("data", data => {
      result += data;
    });

    let errorResult = "";
    proc.stderr.on("data", data => {
      errorResult += data;
    });

    info.id = String(this.id);
    proc.stdin.write(JSON.stringify(info));
    proc.stdin.end();

    try {
      await promisifyProcess(proc);
    } catch (e) {
      const error = { name: "request error", message: errorResult.trim() };
      await this.reporter.error(error);
      return e;
    }

    const stdout: {
      body: { data: T };
      error?: { data: { name: string }; message: string };
    } = JSON.parse(result.trim().split("\n")[0]);

    if (stdout.error !== undefined) {
      const error = {
        name: stdout.error.data.name,
        message: stdout.error.message,
      };
      await this.reporter.error(error);
      return [null, error];
    }

    return [stdout.body.data, null];
  }

  public async receiveAsyncOnEvent<T>(
    keyFilter: any,
    filter: any,
    regexFilter: any,
    eventCallback: { (arg: T): any },
    debounceInterval: number = 0
  ): Promise<ChildProcess> {
    const client = await this.configRepository.getExecutableClient();
    const port = await this.configRepository.getPort();
    const portOption = port === null ? [] : ["--port", String(port)];
    const p = spawn(
      client,
      portOption.concat([
        "receive",
        "--filter",
        JSON.stringify({
          operator: "and",
          filters: [
            { type: "containedKey", map: keyFilter },
            { type: "contained", map: filter },
            { type: "regexp", map: regexFilter },
          ],
        }),
        "--debounce",
        debounceInterval.toString(),
      ])
    );

    p.stdout.setEncoding("utf-8");
    p.stdout.on("data", data => {
      const stdout: { body: { data: T } } = JSON.parse(
        data.trim().split("\n")[0]
      );
      eventCallback(stdout.body.data);
    });

    return p;
  }
}
