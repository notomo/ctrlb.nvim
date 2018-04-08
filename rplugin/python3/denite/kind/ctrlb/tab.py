

from ctrlb.ctrlb import Ctrlb
from denite.kind.base import Base


class Kind(Base):

    def __init__(self, vim):
        super().__init__(vim)

        self.name = 'ctrlb/tab'
        self.default_action = 'activate'

    def action_activate(self, context):
        ctrlb = Ctrlb(self.vim)
        target = context['targets'][0]
        tab_id = target['action__tab_id']
        ctrlb.execute('tab', 'activate', {'id': tab_id})

    def action_preview(self, context):
        self.action_activate(context)

    def action_open(self, context):
        self.action_activate(context)
