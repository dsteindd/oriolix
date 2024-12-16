import json

from mixins import JSONMixin


class FilePreprocessingFailedIntegrationEvent(JSONMixin):

    def __init__(self, fileId: str):
        self.fileId = fileId


class FilePreprocessedIntegrationEvent(JSONMixin):
    def __init__(self, fileId: str, duration: float, sample_rate: int):
        self.fileId = fileId
        self.durationSeconds = duration
        self.sampleRate = sample_rate


class FileUploadedIntegrationEvent(object):
    def __init__(self,
                 fileId: str,
                 fileName: str,
                 specFileName: str,
                 denoiseFileName: str,
                 specDenoiseFileName: str
                 ):
        self.fileId = fileId
        self.fileName = fileName
        self.specFileName = specFileName
        self.denoiseFileName = denoiseFileName
        self.specDenoiseFileName = specDenoiseFileName

    @staticmethod
    def from_json_string(payload: str):

        def as_payload_object(dct) -> FileUploadedIntegrationEvent:
            return FileUploadedIntegrationEvent(
                dct['FileId'],
                dct['FileName'],
                dct['SpecFileName'],
                dct['DenoiseFileName'],
                dct['SpecDenoiseFileName']
            )

        return json.loads(payload, object_hook=as_payload_object)
