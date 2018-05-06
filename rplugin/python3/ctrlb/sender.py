
import asyncio
import json


class Sender(asyncio.SubprocessProtocol):

    def __init__(self, ctrlb) -> None:
        self._ctrlb = ctrlb

    def connection_made(self, transport):
        pass

    def pipe_data_received(self, fd, data):
        try:
            json_array = json.loads(data.decode(), 'utf-8')
            self._ctrlb._put(json_array)
        except Exception as e:
            self._ctrlb.echo_error()

    def process_exited(self):
        pass
