
from neovim import Nvim

from .action import ActionInfo
from .buffer import Facade
from .custom import Custom
from .echoable import Echoable
from .sender import SenderHub


class Ctrlb(Echoable):

    def __init__(self, vim: Nvim) -> None:
        self._vim = vim
        self._custom = Custom(vim)
        self._buffer_facade = Facade(self._vim, self._custom)

    def execute_by_string(self, arg_string: str):
        return self._send(ActionInfo.from_arg_string(arg_string))

    def execute(self, kind_name: str, action_name: str, args={}):
        info = ActionInfo(kind_name, action_name, args)
        return self._send(info)

    def custom(self, name: str, value):
        self._custom.set(name, value)

    def open(self, arg_string: str):
        self._buffer_facade.open(arg_string)

    def execute_buffer_action(self, event_name: str):
        self._buffer_facade.execute(event_name)

    def _send(self, action_info: ActionInfo):
        return SenderHub(
            self._vim,
            self._custom.executable_path,
            action_info.to_dict()
        )
