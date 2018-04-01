
from .exception import InvalidArgumentException


class Custom(object):

    DEFAULT = {
        'host': '127.0.0.1',
        'port': 8888,
    }

    def __init__(self) -> None:
        self._attributes = self.DEFAULT

    def set(self, name: str, value):
        if name not in self._attributes:
            raise InvalidArgumentException(
                '{} does not exist in options.'.format(name)
            )
        self._attributes[name] = value

    @property
    def port(self):
        return self._attributes['port']

    @property
    def host(self):
        return self._attributes['host']
