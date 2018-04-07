
from ctrlb.ctrlb import Ctrlb
from denite.source.base import Base


class Source(Base):

    def __init__(self, vim):
        super().__init__(vim)

        self.name = 'ctrlb/bookmark/recent'
        self.kind = 'ctrlb/bookmark'

    def gather_candidates(self, context):
        ctrlb = Ctrlb(self.vim)
        limit = (
            ' -limit={}'.format(context['args'][0])
            if len(context['args']) > 0
            else ''
        )
        bookmarks = ctrlb.execute('bookmark:list{}'.format(limit))

        def create(b):
            url = b['url'] if 'url' in b else ''
            return {
                'word': '{} {}'.format(url, b['title']),
                'action__bookmark_id': b['id'],
                'action__url': url,
                'action__title': b['title'],
            }

        return [create(b) for b in bookmarks['body']]
