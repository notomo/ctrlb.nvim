
from ctrlb.ctrlb import Ctrlb
from denite.source.base import Base


class Source(Base):

    def __init__(self, vim):
        super().__init__(vim)

        self.name = 'ctrlb/history/search'
        self.kind = 'ctrlb/history'

    def gather_candidates(self, context):
        context['is_interactive'] = True

        input_text = ' '.join([*context['args'], context['input']])

        # TODO
        if len(input_text.rstrip()) < 3:
            return []

        ctrlb = Ctrlb(self.vim)
        histories = ctrlb.execute('history', 'search', {
            'input': input_text
        })

        def create(h):
            url = h['url'] if 'url' in h else ''
            return {
                'word': '{} {}'.format(url, h['title']),
                'action__history_id': h['id'],
                'action__url': url,
                'action__title': h['title'],
            }

        return [create(h) for h in histories['body']]
