
from ctrlb.ctrlb import Ctrlb
from denite.source.base import Base


class Source(Base):

    def __init__(self, vim):
        super().__init__(vim)

        self.name = 'ctrlb/bookmark/search'
        self.kind = 'ctrlb/bookmark'

    def gather_candidates(self, context):
        context['is_interactive'] = True

        input_text = ' '.join([*context['args'], context['input']])

        # TODO
        if len(input_text.rstrip()) < 3:
            return []

        ctrlb = Ctrlb(self.vim)
        bookmarks = ctrlb.execute(
            'bookmark:search -input="{}"'.format(input_text)
        )

        def create(b):
            url = b['url'] if 'url' in b else ''
            return {
                'word': '{} {}'.format(url, b['title']),
                'action__bookmark_id': b['id'],
                'action__url': url,
            }

        return [create(b) for b in bookmarks['body']]
