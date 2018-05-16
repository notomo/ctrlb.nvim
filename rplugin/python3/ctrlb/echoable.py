
import traceback

from neovim import Nvim


class Echoable(object):

    def __init__(self, vim: Nvim) -> None:
        self._vim = vim

    def echo_message(self, message):
        self._vim.command(
            'echomsg "{}"'.format(
                self._vim.call('escape', str(message), '\\"')
            )
        )

    def echo_error(self):
        lines = traceback.format_exc().splitlines()
        self._vim.err_write('[ctrlb] {}\n'.format('\n'.join(lines)))
