
import neovim

from .ctrlb import Ctrlb


@neovim.plugin
class CtrlbHandler(object):

    def __init__(self, vim):
        self._ctrlb = Ctrlb(vim)

    @neovim.function('_ctrlb_execute', sync=True)
    def execute(self, args):
        return self._ctrlb.execute(args[0])

    @neovim.function('_ctrlb_custom', sync=True)
    def custom(self, args):
        self._ctrlb.custom(args[0], args[1])

    @neovim.function('_ctrlb_open', sync=True)
    def open(self, args):
        self._ctrlb.open(args[0])
