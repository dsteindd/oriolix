import math
import os
from typing import List

import librosa
import numpy as np
from PIL import Image
from threadpoolctl import threadpool_limits
import config


def get_save_block_length(frame_length:int, hop_length: int):
    # number of samples read (block_length - 1)*hop_length + nperseg <= sr*config.MAXIMUM_FRAME_LENGTH
    # block_length <= 1 + (sr*MAXIMUM - nperseg)/hop_length
    # block_length = 2**(floor(ld(RHS)))

    upper_bound = (config.MAX_SAMPLES_PER_BLOCK - frame_length) / hop_length + 1
    
    block_length = 2**(math.floor(math.log2(upper_bound)))

    return block_length


# def get_save_win_len(sr: int):
#     win_len_plain = sr * config.NFFT_DURATION
#     log2 = math.log2(win_len_plain)
#     log_lower = math.floor(log2)
#     log_upper = math.floor(log2)
#     win_len_lower = 2 ** log_lower
#     win_len_upper = 2 ** log_upper
#     if win_len_plain - win_len_lower < win_len_upper - win_len_plain:
#         return win_len_lower
#     else:
#         return win_len_upper


def scale_minmax(x, to_min=0.0, to_max=1.0):
    x_std = (x - x.min()) / (x.max() - x.min())
    x_scaled = x_std * (to_max - to_min) + to_min
    return x_scaled


def get_spectrogram(
        frame: List[float],
        sr: int,
        nfft: int,
        hop_length: int,
        streamed: bool = False
):
    if len(frame) > config.MAX_SAMPLES_PER_BLOCK:
        raise Exception("Called (short) spectrogram method with too long sequence. "
                        "This is raised since this can lead to memory issues. "
                        "Use the streamed version 'get_spectrogram_streamed'")


    # get spectrogram
    # print(f"Calculating spec for {filename}")
    # win_length = get_save_win_len(sr)
    # hop_length = int(win_length * (100 - config.SPEC_OVERLAP) / 100)

    with threadpool_limits(limits=os.cpu_count() - 2):
        mels = librosa.feature.melspectrogram(y=frame,
                                              sr=sr,
                                              n_mels=config.N_MELS,
                                              win_length=nfft,
                                              n_fft=nfft,
                                              hop_length=hop_length,
                                              htk=True,
                                              center=not streamed
                                              )

    return mels


def normalize(mels):
    mels = librosa.power_to_db(mels, ref=np.max)

    # min-max scale to fit inside 8-bit range
    img = scale_minmax(mels, 0, 255).astype(np.uint8)
    img = np.flip(img, axis=0)  # put low frequencies at the bottom in image

    return img


def save(spec, filepath):
    seg_img = Image.fromarray(spec.astype('uint8')).convert('L')
    seg_img.save(filepath, 'PNG')
