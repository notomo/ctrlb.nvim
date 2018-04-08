
import json

from neovim import Nvim
from websocket import create_connection, setdefaulttimeout

from .action import ActionInfo
from .custom import Custom
from .echoable import Echoable


class Ctrlb(Echoable):

    def __init__(self, vim: Nvim) -> None:
        self._vim = vim
        self._custom = Custom()
        # TODO: config
        setdefaulttimeout(1)

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
        options['modifiable'] = False
        self._vim.command('silent doautocmd WinEnter')
        self._vim.command('silent doautocmd BufWinEnter')
        self._vim.command('silent doautocmd FileType ctrlb')

    def _send(self, action_info: ActionInfo):
        host = self._custom.host
        port = self._custom.port
        # TODO: error handling
        connection = create_connection('ws://{}:{}'.format(host, port))

        data = json.dumps({**action_info.to_dict(), **{'client': 'vim'}})
        connection.send(data)

        result = json.loads(connection.recv())
        connection.close()
        return result
