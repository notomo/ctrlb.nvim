

from ctrlb.ctrlb import Ctrlb
from denite import util
from denite.kind.base import Base


class Kind(Base):

    def __init__(self, vim):
        super().__init__(vim)

        self.name = 'ctrlb/bookmark'
        self.default_action = 'open'

        self.redraw_actions += ['rename']
        self.persist_actions += ['rename']

    def action_tabopen(self, context):
        ctrlb = Ctrlb(self.vim)
        target = context['targets'][0]
        bookmark_id = target['action__bookmark_id']
        ctrlb.execute('bookmark', 'tabOpen', {'id': bookmark_id})

    def action_open(self, context):
        ctrlb = Ctrlb(self.vim)
        target = context['targets'][0]
        bookmark_id = target['action__bookmark_id']
        ctrlb.execute('bookmark', 'open', {'id': bookmark_id})

    def action_preview(self, context):
        self.action_open(context)

    def action_rename(self, context):
        ctrlb = Ctrlb(self.vim)
        target = context['targets'][0]

        title = util.input(
            self.vim,
            context,
            'title > ',
            target['action__title']
        )

        ctrlb.execute('bookmark', 'update', {
            'id': target['action__bookmark_id'],
            'title': title
        })
