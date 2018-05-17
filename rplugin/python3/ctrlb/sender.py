
import asyncio
import json
from functools import partial
from queue import Queue
from typing import Any, Dict

from neovim import Nvim

from .echoable import Echoable


class SenderHub(Echoable):

    def __init__(
        self,
        vim: Nvim,
        executable_path: str,
        data: Dict[str, Any]
    ) -> None:
        self._vim = vim
        self._results = Queue()  # type: Queue[Dict[str, Any]]
        self._task, self._process = self._execute(executable_path, data)

    def _execute(self, executable_path: str, data: Dict[str, Any]):
        process = self._vim.loop.subprocess_exec(
            partial(
                SenderProtocol,
                self,
                self._vim
            ),
            executable_path,
            '--timeout',
            '3',
            'send',
            '--json',
            json.dumps(data)
        )
        return self._vim.loop.create_task(process), process

    def _put(self, json_array):
        self._results.put(json_array)

    def _cancel(self):
        self._process.kill()
        self._process = None
        self._task.cancel()
        self._task = None

    def get_result(self, timeout):
        return self._results.get(timeout=timeout)


class SenderProtocol(asyncio.SubprocessProtocol):

    def __init__(self, hub: SenderHub, vim: Nvim) -> None:
        self._hub = hub
        self._vim = vim

    def connection_made(self, transport):
        self._transport = transport

    def pipe_data_received(self, fd, data):
        try:
            json_array = json.loads(data.decode().split('\n')[0], 'utf-8')
            self._hub._put(json_array)
        except Exception as e:
            self._hub.echo_error()
        finally:
            # TODO kill all zombie processes
            self._transport.kill()
            self._transport = None
            self._hub._cancel()

    def process_exited(self):
        pass
