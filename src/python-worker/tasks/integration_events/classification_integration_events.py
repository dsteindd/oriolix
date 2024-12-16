import json
from typing import List

from mixins import JSONMixin


class ClassificationFailedIntegrationEvent(JSONMixin):

    def __init__(self, networkId: str, fileId: str):
        self.networkId = networkId
        self.fileId = fileId


class ClassificationDoneIntegrationEvent(JSONMixin):
    def __init__(self, networkId: str, fileId: str, report: List):
        self.networkId = networkId
        self.fileId = fileId
        self.report = report


class Classification(JSONMixin):
    def __init__(self, label: str, confidence: float, fromTime: int, toTime: int):
        self.label = label
        self.confidence = confidence
        self.fromTime = fromTime
        self.toTime = toTime


class ClassificationRequestedIntegrationEvent(object):
    def __init__(self,
                 network_id: str,
                 network_name: str,
                 file_id: str,
                 file_name: str,
                 frame_duration: int,
                 frame_overlap: int
                 ):
        self.network_id = network_id
        self.file_id = file_id
        self.network_name = network_name
        self.file_name = file_name
        self.frame_duration = frame_duration
        self.frame_overlap = frame_overlap

    @staticmethod
    def from_json_string(payload: str):

        def as_payload_object(dct) -> ClassificationRequestedIntegrationEvent:
            return ClassificationRequestedIntegrationEvent(
                dct['NetworkId'],
                dct['NetworkFileName'],
                dct['AudioFileId'],
                dct['AudioFileName'],
                dct['FrameDuration'],
                dct['FrameOverlap']
            )

        return json.loads(payload, object_hook=as_payload_object)
