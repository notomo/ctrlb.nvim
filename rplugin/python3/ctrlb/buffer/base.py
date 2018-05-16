
from abc import ABCMeta, abstractmethod
from typing import Any, Dict, List

from neovim import Nvim

from ctrlb.client import Client
from ctrlb.echoable import Echoable
from ctrlb.receiver import ReceiverHub


class ReceiverHubArg(object):

    def __init__(
        self,
        filter_dict: Dict[str, Any],
        key_filter_dict: Dict[str, Any],
        callback
    ) -> None:
        self._filter_dict = filter_dict
        self._key_filter_dict = key_filter_dict
        self._callback = callback

    @property
    def filter_dict(self) -> Dict[str, Any]:
        return self._filter_dict

    @property
    def key_filter_dict(self) -> Dict[str, Any]:
        return self._key_filter_dict

    @property
    def callback(self):
        return self._callback


class Keymap(object):

    def __init__(
        self, command: str, action_name: str
    ) -> None:
        self._command = command
        self._action_name = action_name

    @property
    def command(self) -> str:
        return self._command

    @property
    def action_name(self) -> str:
        return self._action_name


class Base(Echoable, metaclass=ABCMeta):

    buffer_options = {
        'buftype': 'nofile',
        'swapfile': False,
        'buflisted': True,
        'modifiable': True,
    }

    def __init__(self, vim: Nvim, executable_path: str) -> None:
        self._vim = vim
        file_type = self.file_type
        self._vim.command('tabnew {}'.format(file_type))
        self._buffer = self._vim.current.buffer
        options = self._buffer.options
        for key, value in self.buffer_options.items():
            options[key] = value
        options['filetype'] = file_type
        self._vim.command('silent doautocmd WinEnter')
        self._vim.command('silent doautocmd BufWinEnter')
        for keymap in self.keymaps:
            self._map(keymap.command, keymap.action_name)
        self._vim.command('doautocmd FileType {}'.format(file_type))
        self._tasks = self._execute(executable_path)
        self._client = Client(self._vim)

    def open(self) -> 'Base':
        self._vim.command('tabnew')
        self._vim.command('buffer {}'.format(self._buffer.number))
        return self

    def valid(self) -> bool:
        return self._buffer.valid and all([
            self._buffer.options[key] == value
            for key, value in self.buffer_options.items()
        ])

    @property
    @abstractmethod
    def receiver_hub_args(self) -> List[ReceiverHubArg]:
        pass

    @property
    @abstractmethod
    def name(self) -> str:
        pass

    @property
    def file_type(self) -> str:
        return 'ctrlb-{}'.format(self.name)

    @property
    @abstractmethod
    def keymaps(self) -> List[Keymap]:
        pass

    def execute_action(self, action_name: str):
        pass

    def _execute(self, executable_path: str):
        return [
            ReceiverHub(
                self._vim,
                executable_path,
                arg.filter_dict,
                arg.key_filter_dict,
                arg.callback
            )
            for arg in self.receiver_hub_args
        ]

    def _map(self, map_command: str, action_name: str):
        self._vim.command(
            '{} <buffer> <Plug>(ctrlb-{}-{}) '
            ':<C-u>doautocmd User Ctrlb:{}:{}<CR>'.format(
                map_command, self.name, action_name, self.name, action_name
            )
        )
