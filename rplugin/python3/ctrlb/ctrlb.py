
import json

from neovim import Nvim
from websocket import create_connection, setdefaulttimeout

from .action import ActionInfo
from .custom import Custom
from .echoable import Echoable


class Ctrlb(Echoable):

    def __init__(self, vim: Nvim) -> None:
        self._vim = vim
        self._custom = Custom()
        # TODO: config
        setdefaulttimeout(1)

    def execute(self, arg_string: str):
        return self._send(ActionInfo.from_arg_string(arg_string))

    def custom(self, name: str, value):
        self._custom.set(name, value)

    def _send(self, action_info: ActionInfo):
        host = self._custom.host
        port = self._custom.port
        # TODO: error handling
        connection = create_connection('ws://{}:{}'.format(host, port))

        data = json.dumps({**action_info.to_dict(), **{'client': 'vim'}})
        connection.send(data)

        result = json.loads(connection.recv())
        connection.close()
        return result
