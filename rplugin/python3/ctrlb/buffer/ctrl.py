
from typing import List

from .base import Base, Keymap, ReceiverHubArg


class Ctrl(Base):

    @property
    def receiver_hub_args(self) -> List[ReceiverHubArg]:
        return []

    @property
    def name(self) -> str:
        return 'ctrl'

    @property
    def keymaps(self) -> List[Keymap]:
        return []
