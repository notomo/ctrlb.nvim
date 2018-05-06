

from neovim import Nvim

from .exception import InvalidArgumentException, InvalidSettingException


class Custom(object):

    DEFAULT = {
        'executable_path': 'wsxhub',
    }

    def __init__(self, vim: Nvim) -> None:
        self._attributes = self.DEFAULT
        self._vim = vim

    def set(self, name: str, value):
        if name not in self._attributes:
            raise InvalidArgumentException(
                '{} does not exist in options.'.format(name)
            )
        self._attributes[name] = value

    @property
    def executable_path(self) -> str:
        path = self._attributes['executable_path']
        if not self._vim.call('executable', path):
            raise InvalidSettingException(
                'Invalid executable path: {}'.format(path)
            )
        return path
