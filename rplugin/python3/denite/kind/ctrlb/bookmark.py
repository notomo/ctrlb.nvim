

from ctrlb.client import Client
from denite import util
from denite.kind.base import Base


class Kind(Base):

    def __init__(self, vim):
        super().__init__(vim)

        self.name = 'ctrlb/bookmark'
        self.default_action = 'open'

        self.redraw_actions += ['rename', 'delete']
        self.persist_actions += ['rename', 'delete']

    def action_tabopen(self, context):
        client = Client(self.vim)
        target = context['targets'][0]
        bookmark_id = target['action__bookmark_id']
        client.execute('bookmark', 'tabOpen', {'id': bookmark_id})

    def action_open(self, context):
        client = Client(self.vim)
        target = context['targets'][0]
        bookmark_id = target['action__bookmark_id']
        client.execute('bookmark', 'open', {'id': bookmark_id})

    def action_preview(self, context):
        self.action_open(context)

    def action_delete(self, context):
        client = Client(self.vim)
        for target in context['targets']:
            bookmark_id = target['action__bookmark_id']
            client.execute('bookmark', 'remove', {'id': bookmark_id})

    def action_rename(self, context):
        client = Client(self.vim)
        target = context['targets'][0]

        title = util.input(
            self.vim,
            context,
            'title > ',
            target['action__title']
        )

        client.execute('bookmark', 'update', {
            'id': target['action__bookmark_id'],
            'title': title
        })
