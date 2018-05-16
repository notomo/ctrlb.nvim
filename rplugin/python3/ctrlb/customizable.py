
from neovim import Nvim

from .exception import InvalidSettingException


class Customizable(object):

    _CUSTOM_DICT_NAME = 'ctrlb#_custom'

    def __init__(self, vim: Nvim) -> None:
        self._vim = vim

    def _get(self, name: str):
        custom_dict = self._vim.call('ctrlb#get_custom')
        if not isinstance(custom_dict, dict):
            raise InvalidSettingException('{} must be dict'.format(
                self._CUSTOM_DICT_NAME
            ))
        if name not in custom_dict:
            raise InvalidSettingException('{} not exists in '.format(
                name, self._CUSTOM_DICT_NAME
            ))
        return custom_dict[name]

    @property
    def executable_path(self) -> str:
        path = self._get('executable_path')
        if not self._vim.call('executable', path):
            raise InvalidSettingException(
                'Invalid executable path: {}'.format(path)
            )
        return path
