
import json

from neovim import Nvim

from .action import ActionInfo
from .custom import Custom
from .echoable import Echoable
# from .receiver import Receiver
from .sender import SenderHub


class Ctrlb(Echoable):

    def __init__(self, vim: Nvim) -> None:
        self._vim = vim
        self._custom = Custom(vim)

    def execute_by_string(self, arg_string: str):
        return self._send(ActionInfo.from_arg_string(arg_string))

    def execute(self, kind_name: str, action_name: str, args={}):
        info = ActionInfo(kind_name, action_name, args)
        return self._send(info)

    def custom(self, name: str, value):
        self._custom.set(name, value)

    def open(self, arg_string: str):
        self._vim.command('tabnew ctrlb')
        buf = self._vim.current.buffer
        options = buf.options
        options['buftype'] = 'nofile'
        options['swapfile'] = False
        options['buflisted'] = False
        options['filetype'] = 'ctrlb'
        self._vim.command('silent doautocmd WinEnter')
        self._vim.command('silent doautocmd BufWinEnter')
        self._vim.command('silent doautocmd FileType ctrlb')
        # process = self._vim.loop.subprocess_exec(
        #     partial(Receiver, self, self._vim),
        #     self._custom.executable_path,
        #     'receive'
        # )
        # self._vim.loop.create_task(process)

    def _send(self, action_info: ActionInfo):
        data = json.dumps(action_info.to_dict())
        return SenderHub(
            self._vim,
            self._custom.executable_path,
            data
        )
