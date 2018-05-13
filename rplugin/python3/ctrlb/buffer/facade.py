
from typing import Dict, Type  # noqa

from neovim import Nvim

from ctrlb.custom import Custom

from .base import Base  # noqa
from .ctrl import Ctrl
from .history import History


class Facade(object):

    BUFFER_CLASSES = {
        'ctrl': Ctrl,
        'history': History,
    }  # type: Dict[str, Type[Base]]

    def __init__(
        self, vim: Nvim, custom: Custom
    ) -> None:
        self._vim = vim
        self._custom = custom
        self._buffers = {}  # type: Dict[str, Base]

    def open(self, arg_string: str):
        names = arg_string.split()
        executable_path = self._custom.executable_path
        buffers = {
            name: self._buffers[name].open()
            if name in self._buffers and self._buffers[name].valid()
            else self.BUFFER_CLASSES[name](
                self._vim,
                executable_path
            )
            for name in names
        }
        self._buffers = {**self._buffers, **buffers}
        return buffers
