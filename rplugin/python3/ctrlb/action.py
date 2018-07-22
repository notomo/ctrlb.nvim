
from typing import Any, Dict, Union

from .exception import InvalidArgumentException


class ActionInfo(object):

    def __init__(self, kind_name: str, action_name: str, args: Dict) -> None:
        if kind_name == '' or action_name == '':
            raise InvalidArgumentException(
                'kind_name and action_name must not be empty.'
            )
        self._kind_name = kind_name
        self._action_name = action_name
        self._args = {
            key: ActionInfo._convert_value(value)
            for key, value
            in args.items()
        }

    @classmethod
    def from_arg_string(cls, arg_string: str) -> 'ActionInfo':
        kind_name = ''
        action_name = ''
        args = {}  # type: Dict[str, Union[str,int,float]]

        for arg in arg_string.split(' '):
            key_value = arg.split('=')
            key = key_value[0]
            if not key.startswith('-'):
                if ':' not in key:
                    continue
                names = key.split(':')
                kind_name = names.pop(0)
                action_name = names.pop(0)
            elif len(key_value) > 1:
                value = key_value[1]
                args[key[1:]] = ActionInfo._convert_value(value)

        return cls(kind_name, action_name, args)

    def to_dict(self) -> Dict[str, Any]:
        return {
            'actionName': self._action_name,
            'actionGroupName': self._kind_name,
            'args': self._args,
        }

    @staticmethod
    def _convert_value(value: str) -> Union[str, int, float]:
        if value.isdigit():
            return int(value)
        elif value.replace('.', '', 1).isdigit():
            return float(value)
        return str(value)
