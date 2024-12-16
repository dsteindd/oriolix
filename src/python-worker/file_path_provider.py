import os.path

import config


def get_audio_file_path(file_name: str):
    return os.path.join(config.audio_base_dir, file_name)


def get_network_file_path(network_name: str):
    return os.path.join(config.network_base_dir, network_name)


def get_spec_file_path(spec_name: str):
    return os.path.join(config.audio_base_dir, spec_name)