import logging
from typing import Callable, Dict

import aio_pika
import aiormq.abc
from aio_pika import Message, DeliveryMode, Channel

import config
from tasks.integration_events.classification_integration_events import ClassificationFailedIntegrationEvent, ClassificationRequestedIntegrationEvent
from connections_helper import get_publisher_connection, get_consumer_connection
from mixins import JSONMixin
from tasks.integration_events.fileupload_integration_events import FileUploadedIntegrationEvent, \
    FilePreprocessingFailedIntegrationEvent


async def publish(event: JSONMixin):

    body = event.to_json().encode()
    print("Body to send", body)
    conn = await get_publisher_connection()

    async with conn:
        print("Connection established")
        channel = await conn.channel()
        print("Channel established")

        print("Publish channel created...")

        exchange = await channel.declare_exchange(
            name=config.broker_name,
            type="direct"
        )
        
        print(f"Publishing message with routing key {type(event).__name__}")

        await exchange.publish(
            message=Message(body, delivery_mode=DeliveryMode.PERSISTENT),
            routing_key=type(event).__name__,
            mandatory=True
        )
        print("Publish finished")
        await channel.close()
        print("Publish channel closed")


_handler_dict: Dict[type, Callable] = dict()


async def send_result(channel: aiormq.abc.AbstractChannel, result: JSONMixin):
    await channel.basic_publish(
        body=result.to_json().encode(),
        exchange=config.broker_name,
        routing_key=type(result).__name__,
        mandatory=True
    )



async def process_event(message: aio_pika.abc.AbstractIncomingMessage):
    async with message.process(ignore_processed=True):
        if message.routing_key == ClassificationRequestedIntegrationEvent.__name__:
            event = ClassificationRequestedIntegrationEvent.from_json_string(message.body.decode())
            try:
                result: JSONMixin = await _handler_dict[type(event)](event)
                print("Handler finished. ACK")
                await send_result(message.channel, result)
                # await message.channel.basic_publish(
                #     body=result.to_dict().encode(),
                #     exchange=config.broker_name,
                #     routing_key=type(event).__name__,
                #     mandatory=True
                # )
                # await message.channel.basic_ack(
                #     delivery_tag=message.delivery_tag
                # )

                print("ACK'd")
            except Exception as e:
                print(f"Error occured {e}")
                error_event = ClassificationFailedIntegrationEvent(event.network_id, event.file_id)
                await publish(error_event)
                await message.reject(requeue=False)
        elif message.routing_key == FileUploadedIntegrationEvent.__name__:
            event = FileUploadedIntegrationEvent.from_json_string(message.body.decode())
            try:
                result: JSONMixin = await _handler_dict[type(event)](event)
                await send_result(message.channel, result)
            except Exception as e:
                print(f"Error occured {e}")
                error_event = FilePreprocessingFailedIntegrationEvent(event.fileId)
                await publish(error_event)
                await message.reject(requeue=False)
        else:
            await message.reject(requeue=False)


def set_handler_dictionary(handlers: Dict[type, Callable]):
    global _handler_dict
    _handler_dict = handlers


async def subscribe():
    # global _handler_dict

    # _handler_dict[eventType] = handler

    consumer_connection = await get_consumer_connection()
    channel = await consumer_connection.channel()

    await channel.set_qos(prefetch_count=1)

    await channel.declare_exchange(
        name=config.broker_name,
        durable=False
    )

    queue = await channel.declare_queue(
        name=config.subscription_queue_name,
        durable=True,
    )

    for event_type in _handler_dict.keys():
        await queue.bind(
            exchange=config.broker_name,
            routing_key=event_type.__name__
        )

    await queue.consume(
        callback=process_event,
        no_ack=False,
        timeout=1800
    )

