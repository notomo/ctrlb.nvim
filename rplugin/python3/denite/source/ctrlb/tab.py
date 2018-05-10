

from queue import Empty

from ctrlb.ctrlb import Ctrlb
from denite.source.base import Base


class Source(Base):

    def __init__(self, vim):
        super().__init__(vim)

        self.name = 'ctrlb/tab'
        self.kind = 'ctrlb/tab'

    def on_init(self, context):
        context['__task'] = None

    def gather_candidates(self, context):
        if context['__task'] is not None:
            return self._async_gather_candidates(context)
        ctrlb = Ctrlb(self.vim)
        context['__task'] = ctrlb.execute('tab', 'list')
        return self._async_gather_candidates(context)

    def _async_gather_candidates(self, context):
        try:
            tabs = context['__task'].get_result(0.01)
        except Empty:
            context['is_async'] = True
            return []
        context['is_async'] = False
        context['__task'] = None
        return [
            {
                'word': t['url'],
                'action__tab_id': t['id'],
                'action__url': t['url'],
                'action__title': t['title'],
            } for t in tabs['body']
        ]
