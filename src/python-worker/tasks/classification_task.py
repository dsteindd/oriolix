import datetime
import os
from timeit import timeit
from typing import List, Tuple

import librosa
import numpy as np
import tensorflow as tf
import tensorflow.keras.backend
from PIL import Image
from tensorflow.keras.models import Model, load_model

import config
from event_bus import publish
from file_path_provider import get_network_file_path, get_audio_file_path
from network_db_helpers import get_labels_of_network
from tasks.helpers import get_spectrogram, normalize
from tasks.integration_events.classification_integration_events import ClassificationDoneIntegrationEvent, \
    Classification, ClassificationRequestedIntegrationEvent


def get_dataset(
        indices: List[Tuple[int, int]],
        wavedata: List[float],
        sr: int,
        width: int,
        height: int,
        channels: int
):
    wavedata = tf.convert_to_tensor(wavedata, dtype=tf.float32)

    nperseg = config.N_FFT
    hop_length = int(nperseg * (100 - config.SPEC_OVERLAP) / 100)

    def py_preprocess(bounds):
        mels = get_spectrogram(
            wavedata[bounds[0]:bounds[1]].numpy(),
            sr,
            nfft=config.N_FFT,
            hop_length=hop_length,
            streamed=False
        )
        img = normalize(mels)
        image = Image \
            .fromarray(img.astype('uint8')) \
            .convert('L') \
            .resize(size=(width, height))
        image_arr = np.array(image)
        image_arr = np.repeat(image_arr[:, :, np.newaxis], channels, axis=2)
        return tf.convert_to_tensor(image_arr)

    def process(bounds: tf.Tensor):

        [image, ] = tf.py_function(py_preprocess, [bounds], [tf.uint8])

        return image

    ds = tf.data.Dataset.from_tensor_slices(indices)
    ds = ds.map(process, num_parallel_calls=os.cpu_count() - 2)
    ds = ds.batch(
        batch_size=config.PREDICTION_BATCH_SIZE,
        drop_remainder=False,
        num_parallel_calls=os.cpu_count() - 2
    )
    ds = ds.prefetch(2)

    return ds


async def process_classification_task(task: ClassificationRequestedIntegrationEvent):
    print(
        f"Received ML Task at {datetime.datetime.utcnow()} "
        f"for network with id {task.network_id} and file id {task.file_id}")

    tf.config.set_visible_devices([], 'GPU')
    conf = tf.compat.v1.ConfigProto(
        device_count={
            'CPU': os.cpu_count() - 2,
            'GPU': 0
        },
        intra_op_parallelism_threads=2,
        inter_op_parallelism_threads=2
    )
    session = tf.compat.v1.Session(config=conf)

    model: Model = load_model(get_network_file_path(task.network_name), compile=False)

    for layer in model.layers:
        layer._set_dtype_policy('float32')

    _, height, width, channels = model.layers[0].input_shape[0]

    # get labels
    labels = get_labels_of_network(task.network_id)

    wavedata, sr = librosa.load(get_audio_file_path(task.file_name), sr=None)

    # frames start and end at [i*(frame_duration-frame_overlap), i*(frame_duration-frame_overlap) + frame_duration]
    # want to have i*(frame_duration-frame_overlap) + frame_length <= duration
    # i_max <= (duration - frame_length)/(frame_duration-frame_overlap)
    num_frames = int((len(wavedata) / sr - task.frame_duration) // (task.frame_duration - task.frame_overlap))

#     frame_bounds = [
#         (
#             int(i * (task.frame_duration - task.frame_overlap) * sr),
#             int((i * (task.frame_duration - task.frame_overlap) + task.frame_duration) * sr)
#         )
#         for i in range(num_frames)
#     ]

#     predictions = model.predict(
#         get_dataset(frame_bounds, wavedata, sr, width, height, channels),
#         verbose=1
#     )


#     print(predictions.shape)

    classifications: List[Classification] = []

#     for i in range(num_frames):
#         result = predictions[i]
#         predicted_indices = np.argsort(result)[::-1][:config.TOP_K]
# 
#         for pred_index in predicted_indices:
#             conf = result[pred_index]
#             if conf >= config.PRED_THRESHOLD:
#                 classifications.append(
#                     Classification(
#                         labels[pred_index],
#                         float(result[pred_index]),
#                         i * (task.frame_duration - task.frame_overlap),
#                         (i * (task.frame_duration - task.frame_overlap) + task.frame_duration)
#                     )
#                 )


    for i in range(num_frames):
        print(f"{i}/{num_frames}")
        min_index = int(i * (task.frame_duration - task.frame_overlap) * sr)
        max_index = int((i * (task.frame_duration - task.frame_overlap) + task.frame_duration) * sr)

        frame = wavedata[min_index:max_index]

        mels = get_spectrogram(frame, sr)
        img = normalize(mels)

        image = Image \
            .fromarray(img.astype('uint8')) \
            .convert('L') \
            .resize(size=(width, height))

        image_arr = np.array(image)
        image_arr = np.repeat(image_arr[np.newaxis, :, :, np.newaxis], channels, axis=3)

        # image_tensor = tf.convert_to_tensor(image_arr, dtype=tf.float32)

        image_ds = tf.data.Dataset.from_tensor_slices([image_arr])

        result = model.predict(image_ds)[0]

        # take top-3 and only if greater than 0.5 threshold
        predicted_indices = np.argsort(result)[::-1][:config.TOP_K]

        for pred_index in predicted_indices:
            conf = result[pred_index]
            if conf >= config.PRED_THRESHOLD:
                classifications.append(
                    Classification(
                        labels[pred_index],
                        float(result[pred_index]),
                        i * (task.frame_duration - task.frame_overlap),
                        (i * (task.frame_duration - task.frame_overlap) + task.frame_duration)
                    )
                )
    
    
    tensorflow.keras.backend.clear_session()
    session.close()
    del model
    
    report = ClassificationDoneIntegrationEvent(
        fileId=task.file_id,
        networkId=task.network_id,
        report=classifications
    )

    print(f"Done ML Task at {datetime.datetime.utcnow()} for "
          f"network with id {task.network_id} and file id {task.file_id}")

    return report
    # await publish(event=report)
