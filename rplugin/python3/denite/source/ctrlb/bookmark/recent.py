
from queue import Empty

from ctrlb.client import Client
from denite.source.base import Base


class Source(Base):

    def __init__(self, vim):
        super().__init__(vim)

        self.name = 'ctrlb/bookmark/recent'
        self.kind = 'ctrlb/bookmark'

    def on_init(self, context):
        context['__task'] = None

    def gather_candidates(self, context):
        if context['__task'] is not None:
            return self._async_gather_candidates(context)

        args = {}
        if len(context['args']) > 0:
            args['limit'] = context['args'][0]
        client = Client(self.vim)
        context['__task'] = client.execute('bookmark', 'list', args)
        return self._async_gather_candidates(context)

    def _async_gather_candidates(self, context):
        try:
            bookmarks = context['__task'].get_result(0.01)
        except Empty:
            context['is_async'] = True
            return []
        context['is_async'] = False
        context['__task'] = None

        def create(b):
            url = b['url'] if 'url' in b else ''
            return {
                'word': '{} {}'.format(url, b['title']),
                'action__bookmark_id': b['id'],
                'action__url': url,
                'action__title': b['title'],
            }

        return [create(b) for b in bookmarks['body']]
