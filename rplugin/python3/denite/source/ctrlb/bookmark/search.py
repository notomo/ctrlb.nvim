
from queue import Empty

from ctrlb.ctrlb import Ctrlb
from denite.source.base import Base


class Source(Base):

    def __init__(self, vim):
        super().__init__(vim)

        self.name = 'ctrlb/bookmark/search'
        self.kind = 'ctrlb/bookmark'

    def on_init(self, context):
        context['__task'] = None
        context['is_interactive'] = True

    def gather_candidates(self, context):
        if (
            context['event'] != 'interactive'and
            context['__task'] is not None
        ):
            return self._async_gather_candidates(context)

        input_text = ' '.join([*context['args'], context['input']])
        if len(input_text.rstrip()) < 2:
            return []

        ctrlb = Ctrlb(self.vim)
        context['__task'] = ctrlb.execute('bookmark', 'search', {
            'input': input_text
        })
        return self._async_gather_candidates(context)

    def _async_gather_candidates(self, context):
        try:
            bookmarks = context['__task'].get_result(0.1)
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
