
from ctrlb.client import Client
from denite.kind.base import Base


class Kind(Base):

    def __init__(self, vim):
        super().__init__(vim)

        self.name = 'ctrlb/window'
        self.default_action = 'activate'

    def action_activate(self, context):
        client = Client(self.vim)
        target = context['targets'][0]
        window_id = target['action__window_id']
        client.execute('window', 'activate', {'id': window_id})

    def action_preview(self, context):
        self.action_activate(context)

    def action_close(self, context):
        client = Client(self.vim)
        target = context['targets']
        for target in context['targets']:
            window_id = target['action__window_id']
            client.execute('window', 'remove', {'id': window_id})
