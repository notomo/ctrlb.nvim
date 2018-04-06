

from ctrlb.ctrlb import Ctrlb
from denite.kind.base import Base


class Kind(Base):

    def __init__(self, vim):
        super().__init__(vim)

        self.name = 'ctrlb/bookmark'
        self.default_action = 'open'

    def action_tabopen(self, context):
        ctrlb = Ctrlb(self.vim)
        target = context['targets'][0]
        bookmark_id = target['action__bookmark_id']
        ctrlb.execute('bookmark:tabOpen -id={}'.format(bookmark_id))

    def action_open(self, context):
        ctrlb = Ctrlb(self.vim)
        target = context['targets'][0]
        bookmark_id = target['action__bookmark_id']
        ctrlb.execute('bookmark:open -id={}'.format(bookmark_id))

    def action_preview(self, context):
        self.action_open(context)
