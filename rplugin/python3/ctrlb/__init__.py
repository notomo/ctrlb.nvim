
import neovim

from .client import Client
from .ctrlb import Ctrlb


@neovim.plugin
class CtrlbHandler(object):

    def __init__(self, vim):
        self._ctrlb = Ctrlb(vim)
        self._vim = vim

    @neovim.function('_ctrlb_execute_test', sync=True)
    def execute(self, args):
        Client(self._vim).execute_by_string(args[0])

    @neovim.function('_ctrlb_open', sync=True)
    def open(self, args):
        self._ctrlb.open(args[0])

    @neovim.autocmd(
        'User',
        'Ctrlb:*',
        sync=True,
        eval='expand("<amatch>")'
    )
    def action_event(self, event_name: str):
        self._ctrlb.execute_buffer_action(event_name)
