
import asyncio
import json
from functools import partial
from queue import Queue
from typing import Any, Dict

from neovim import Nvim

from .customizable import Customizable
from .echoable import Echoable


class ReceiverHub(Echoable, Customizable):

    def __init__(
        self,
        vim: Nvim,
        filter_dict: Dict[str, Any],
        key_filter_dict: Dict[str, Any],
        callback
    ) -> None:
        self._vim = vim
        self._results = Queue()  # type: Queue[Any]
        self._task = self._execute(
            filter_dict, key_filter_dict, callback
        )

    def _execute(
        self,
        filter_dict: Dict[str, Any],
        key_filter_dict: Dict[str, Any],
        callback
    ):
        process = self._vim.loop.subprocess_exec(
            partial(
                ReceiverProtocol,
                self,
                self._vim,
                callback
            ),
            self.executable_path,
            '--key',
            json.dumps(key_filter_dict),
            '--filter',
            json.dumps(filter_dict),
            'receive'
        )
        return self._vim.loop.create_task(process)

    def _put(self, json_array):
        self._results.put(json_array)

    def get_result(self, timeout):
        return self._results.get(timeout=timeout)


class ReceiverProtocol(asyncio.SubprocessProtocol):

    def __init__(self, hub: ReceiverHub, vim: Nvim, callback) -> None:
        self._hub = hub
        self._vim = vim
        self._callback = callback

    def connection_made(self, transport):
        pass

    def pipe_data_received(self, fd, data):
        try:
            json_array = json.loads(data.decode().split('\n')[0], 'utf-8')
            result = self._vim.async_call(
                self._callback,
                json_array
            )
            self._hub._put(result)
        except Exception as e:
            self._ctrlb.echo_error()

    def process_exited(self):
        pass
