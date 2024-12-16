import librosa
import numpy as np
from typing import List

from event_bus import publish
from file_path_provider import get_audio_file_path, get_spec_file_path
from tasks.helpers import get_spectrogram, normalize, save, get_save_block_length
import noisereduce as nr
import soundfile as sf
from tasks.integration_events.fileupload_integration_events import FilePreprocessedIntegrationEvent, \
    FileUploadedIntegrationEvent

import config


def custom_blocks(
        audio: List[int],
        block_length: int,
        frame_length: int,
        hop_length: int
):
    start_index = 0
    audio_length = len(audio)
    block_samples = hop_length * (block_length - 1) + frame_length

    while start_index < audio_length:
        yield audio[start_index:block_samples + start_index]

        start_index += hop_length * block_length




async def calculate_spectrogram(file_path: str, spec_path: str):
    # get labels
    # sr = librosa.get_samplerate(file_path)

    audio, sr = librosa.load(file_path, sr=None, dtype=np.float64)
    audio = audio.astype(np.float32)

    nperseg = config.N_FFT
    hop_length = int(nperseg * (100 - config.SPEC_OVERLAP) / 100)
    
    block_length = get_save_block_length(nperseg, hop_length)
    

    mels = []
    for y_block in custom_blocks(audio, block_length=block_length, frame_length=nperseg, hop_length=hop_length):
        mels_block = get_spectrogram(
            y_block,
            sr,
            nfft=config.N_FFT,
            hop_length=hop_length,
            streamed=True
        )
        mels.append(mels_block)

    mels = np.concatenate(mels, axis=1)
    mels = normalize(mels)

    save(mels, spec_path)


async def denoise(file_path: str, out_path: str):
    amplitudes, sample_rate = librosa.load(file_path,
                                           sr=None
                                           )

    amplitudes = nr.reduce_noise(y=amplitudes, sr=sample_rate)

    sf.write(out_path, amplitudes, samplerate=sample_rate)


async def process_file_upload_task(task : FileUploadedIntegrationEvent):
    print(f"Received File Uploaded integration event for file with id {task.fileId}")

    file_path = get_audio_file_path(task.fileName)
    denoise_file_path = get_audio_file_path(task.denoiseFileName)
    spec_path = get_spec_file_path(task.specFileName)
    spec_denoise_path = get_spec_file_path(task.specDenoiseFileName)

    sr = librosa.get_samplerate(file_path)
    duration = librosa.get_duration(filename=file_path)

    await calculate_spectrogram(file_path, spec_path)

    # await denoise(file_path, denoise_file_path)
    #
    # await calculate_spectrogram(denoise_file_path, spec_denoise_path)

    success_event = FilePreprocessedIntegrationEvent(task.fileId, duration, sr)

    return success_event
