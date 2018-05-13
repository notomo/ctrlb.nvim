
from typing import List

from .base import Base, ReceiverHubArg


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
    def file_type(self) -> str:
        return 'ctrlb-history'

    def _on_received(self, json_array):
        body = json_array['body']
        line = '{}\t{}'.format(body['title'], body['url'])
        self._buffer.append(line)
