
import re
from typing import Dict, Type  # noqa

from neovim import Nvim

from .base import Base  # noqa
from .ctrl import Ctrl
from .history import History


class Facade(object):

    BUFFER_CLASSES = {
        'ctrl': Ctrl,
        'history': History,
    }  # type: Dict[str, Type[Base]]

    EVENT_NAME_PATTERN = 'Ctrlb:([^:]*):(.*)$'

    def __init__(
        self, vim: Nvim
    ) -> None:
        self._vim = vim
        self._buffers = {}  # type: Dict[str, Base]
        self._event_name_pattern = re.compile(self.EVENT_NAME_PATTERN)

    def open(self, arg_string: str):
        names = arg_string.split()
        buffers = {
            name: self._buffers[name].open()
            if name in self._buffers and self._buffers[name].valid()
            else self.BUFFER_CLASSES[name](
                self._vim,
            )
            for name in names
        }
        self._buffers = {**self._buffers, **buffers}
        return buffers

    def execute(self, event_name: str):
        result = self._event_name_pattern.search(event_name)
        if result is None:
            return
        buffer_name = result.group(1)
        action_name = result.group(2)
        if buffer_name not in self._buffers:
            return
        buffer = self._buffers[buffer_name]
        buffer.execute_action(action_name)
