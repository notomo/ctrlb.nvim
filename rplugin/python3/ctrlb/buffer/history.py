
from typing import List

from .base import Base, Keymap, ReceiverHubArg


class History(Base):

    @property
    def receiver_hub_args(self) -> List[ReceiverHubArg]:
        return [
            ReceiverHubArg(
                {},
                {'body': {'title': True, 'url': True}},
                self._on_received
            )
        ]

    @property
    def name(self) -> str:
        return 'history'

    @property
    def keymaps(self) -> List[Keymap]:
        return [
            Keymap('nnoremap', 'open'),
            Keymap('nnoremap', 'tab-open'),
        ]

    def _on_received(self, json_array):
        body = json_array['body']
        line = '{}\t{}'.format(body['title'], body['url'])
        self._buffer.append(line)

    def execute_action(self, action_name: str):
        {
            'open': self._open,
            'tab-open': self._tab_open,
        }[action_name]()

    def _open(self):
        url = self._get_url()
        self._client.execute('tab', 'open', {
            'url': url
        })

    def _tab_open(self):
        url = self._get_url()
        self._client.execute('tab', 'tabOpen', {
            'url': url
        })

    def _get_url(self):
        return self._vim.current.line.split('\t')[-1]
