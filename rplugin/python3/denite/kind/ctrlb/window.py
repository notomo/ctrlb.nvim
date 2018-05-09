
from ctrlb.ctrlb import Ctrlb
from denite.kind.base import Base


class Kind(Base):

    def __init__(self, vim):
        super().__init__(vim)

        self.name = 'ctrlb/window'
        self.default_action = 'activate'

    def action_activate(self, context):
        ctrlb = Ctrlb(self.vim)
        target = context['targets'][0]
        window_id = target['action__window_id']
        ctrlb.execute('window', 'activate', {'id': window_id})

    def action_preview(self, context):
        self.action_activate(context)

    def action_close(self, context):
        ctrlb = Ctrlb(self.vim)
        target = context['targets']
        for target in context['targets']:
            window_id = target['action__window_id']
            ctrlb.execute('window', 'remove', {'id': window_id})
