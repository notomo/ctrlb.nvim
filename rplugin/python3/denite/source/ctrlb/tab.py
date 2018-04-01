

from ctrlb.ctrlb import Ctrlb
from denite.source.base import Base


class Source(Base):

    def __init__(self, vim):
        super().__init__(vim)

        self.name = 'ctrlb/tab'
        self.kind = 'ctrlb/tab'

    def gather_candidates(self, context):
        ctrlb = Ctrlb(self.vim)
        tabs = ctrlb.execute('tab:list')
        return [
            {
                'word': t['url'],
                'action__tab_id': t['id'],
            } for t in tabs['body']
        ]
