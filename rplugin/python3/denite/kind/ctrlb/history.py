

from ctrlb.ctrlb import Ctrlb
from denite.kind.base import Base


class Kind(Base):

    def __init__(self, vim):
        super().__init__(vim)

        self.name = 'ctrlb/history'
        self.default_action = 'open'

    def action_tabopen(self, context):
        ctrlb = Ctrlb(self.vim)
        target = context['targets'][0]
        url = target['action__url']
        ctrlb.execute('tab', 'tabOpen', {'url': url})

    def action_open(self, context):
        ctrlb = Ctrlb(self.vim)
        target = context['targets'][0]
        url = target['action__url']
        ctrlb.execute('tab', 'open', {'url': url})

    def action_preview(self, context):
        self.action_open(context)

    def action_bookmark(self, context):
        ctrlb = Ctrlb(self.vim)
        for target in context['targets']:
            ctrlb.execute('bookmark', 'create', {
                'url': target['action__url'],
                'title': target['action__title'],
            })
