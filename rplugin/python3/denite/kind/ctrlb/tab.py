

from ctrlb.client import Client
from denite.kind.base import Base


class Kind(Base):

    def __init__(self, vim):
        super().__init__(vim)

        self.name = 'ctrlb/tab'
        self.default_action = 'activate'

    def action_activate(self, context):
        client = Client(self.vim)
        target = context['targets'][0]
        tab_id = target['action__tab_id']
        client.execute('tab', 'activate', {'id': tab_id})

    def action_close(self, context):
        client = Client(self.vim)
        target = context['targets']
        for target in context['targets']:
            tab_id = target['action__tab_id']
            client.execute('tab', 'close', {'id': tab_id})

    def action_preview(self, context):
        self.action_activate(context)

    def action_open(self, context):
        self.action_activate(context)

    def action_bookmark(self, context):
        client = Client(self.vim)
        for target in context['targets']:
            client.execute('bookmark', 'create', {
                'url': target['action__url'],
                'title': target['action__title'],
            })
