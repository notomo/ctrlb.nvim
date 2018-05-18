
from .action import ActionInfo
from .echoable import Echoable
from .sender import SenderHub


class Client(Echoable):

    def execute_by_string(self, arg_string: str):
        return self._send(ActionInfo.from_arg_string(arg_string))

    def execute(self, kind_name: str, action_name: str, args={}):
        info = ActionInfo(kind_name, action_name, args)
        return self._send(info)

    def _send(self, action_info: ActionInfo):
        return SenderHub(
            self._vim,
            action_info.to_dict()
        )
