
from queue import Empty

from ctrlb.ctrlb import Ctrlb
from denite.source.base import Base


class Source(Base):

    def __init__(self, vim):
        super().__init__(vim)

        self.name = 'ctrlb/history/search'
        self.kind = 'ctrlb/history'

        self.matchers = []

    def on_init(self, context):
        context['__ctrlb'] = None
        context['is_interactive'] = True

    def gather_candidates(self, context):
        if (
            context['event'] != 'interactive'and
            context['__ctrlb'] is not None
        ):
            return self._async_gather_candidates(context, context['__ctrlb'])

        input_text = ' '.join([*context['args'], context['input']])
        context['__ctrlb'] = Ctrlb(self.vim)
        context['__ctrlb'].execute('history', 'search', {
            'input': input_text
        })
        return self._async_gather_candidates(context, context['__ctrlb'])

    def _async_gather_candidates(self, context, ctrlb):
        try:
            histories = ctrlb.get_result(0.1)
        except Empty:
            context['is_async'] = True
            return []
        context['is_async'] = False
        context['__ctrlb'] = None

        def create(h):
            url = h['url'] if 'url' in h else ''
            return {
                'word': '{} {}'.format(url, h['title']),
                'action__history_id': h['id'],
                'action__url': url,
                'action__title': h['title'],
            }

        return [create(h) for h in histories['body']]
