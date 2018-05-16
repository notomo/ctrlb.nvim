
from neovim import Nvim

from .buffer import Facade
from .echoable import Echoable


class Ctrlb(Echoable):

    def __init__(self, vim: Nvim) -> None:
        self._vim = vim
        self._buffer_facade = Facade(self._vim)

    def open(self, arg_string: str):
        self._buffer_facade.open(arg_string)

    def execute_buffer_action(self, event_name: str):
        self._buffer_facade.execute(event_name)
