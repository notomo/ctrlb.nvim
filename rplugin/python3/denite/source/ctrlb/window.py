
from queue import Empty

from ctrlb.ctrlb import Ctrlb
from denite.source.base import Base


class Source(Base):

    def __init__(self, vim):
        super().__init__(vim)

        self.name = 'ctrlb/window'
        self.kind = 'ctrlb/window'

    def on_init(self, context):
        self.ctrlb = Ctrlb(self.vim)
        context['__task'] = None

    def gather_candidates(self, context):
        if context['__task'] is not None:
            return self._async_gather_candidates(context, context['__task'])
        context['__task'] = self.ctrlb.execute('window', 'list')
        return self._async_gather_candidates(context, context['__task'])

    def _async_gather_candidates(self, context, task):
        try:
            windows = self.ctrlb.get_result(0.01)
        except Empty:
            context['is_async'] = True
            return []
        context['is_async'] = False

        def create(window):
            tabs = window['tabs']
            activeTab = list(filter(lambda t: t['active'], tabs))
            if len(activeTab) == 1:
                tab = activeTab[0]
                word = '{} {}'.format(tab['url'], tab['title'])
            else:
                word = window['id']

            return {
                'word': word,
                'action__window_id': window['id'],
            }

        return [create(w) for w in windows['body']]
