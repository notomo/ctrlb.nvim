
from typing import List

from .base import Base, ReceiverHubArg


class Ctrl(Base):

    @property
    def receiver_hub_args(self) -> List[ReceiverHubArg]:
        return []

    @property
    def file_type(self) -> str:
        return 'ctrlb-ctrl'
