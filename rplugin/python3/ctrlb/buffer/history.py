
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
            Keymap('nnoremap', 'open')
        ]

    def _on_received(self, json_array):
        body = json_array['body']
        line = '{}\t{}'.format(body['title'], body['url'])
        self._buffer.append(line)

    def execute_action(self, action_name: str):
        {
            'open': self._open,
        }[action_name]()

    def _open(self):
        # TODO
        pass
