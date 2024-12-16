from typing import Union

import config
import mariadb
import aio_pika

_publisher_connection: Union[aio_pika.abc.AbstractConnection, None] = None
_consumer_connection: Union[aio_pika.abc.AbstractConnection, None] = None


def get_maria_db_connection():
    return mariadb.connect(
        user=config.mariadb["user"],
        password=config.mariadb["pwd"],
        host=config.mariadb["host"],
        port=config.mariadb["port"],
        database=config.mariadb["database"]
    )


async def _get_connection(heartbeat=None) -> aio_pika.abc.AbstractRobustConnection:
    if heartbeat is None:
        return await aio_pika.connect_robust(
            host=config.rabbitmq["host"],
            login=config.rabbitmq["user"],
            password=config.rabbitmq["pwd"],
            timeout=900
        )
    else:

        return await aio_pika.connect_robust(
            host=config.rabbitmq["host"],
            login=config.rabbitmq["user"],
            password=config.rabbitmq["pwd"],
            timeout=900,
            client_properties={
                'heartbeat': heartbeat
            }
        )


async def get_publisher_connection() -> aio_pika.abc.AbstractRobustConnection:
    return await _get_connection()

    # global _publisher_connection
    #
    # if _publisher_connection is None:
    #     print("Publisher connection was none. Get one...")
    #     _publisher_connection = await _get_connection()
    #     print("Publisher connection created...")
    # if _publisher_connection.is_closed:
    #     print("Publisher connection was closed. Connecting")
    #     await _publisher_connection.connect()
    # else:
    #     print("Publisher connection was not closed...")
    # return _publisher_connection


async def get_consumer_connection() -> aio_pika.abc.AbstractRobustConnection:
    global _consumer_connection

    if _consumer_connection is None:
        _consumer_connection = await _get_connection(heartbeat=1800)
    if _consumer_connection.is_closed:
        await _consumer_connection.connect()
    return _consumer_connection


__all__ = [
    "get_consumer_connection",
    "get_publisher_connection"
]
