import asyncio
import logging

from tasks.file_upload_task import process_file_upload_task
from tasks.integration_events.classification_integration_events import ClassificationRequestedIntegrationEvent
from connections_helper import get_consumer_connection
from event_bus import subscribe, set_handler_dictionary
from tasks.classification_task import process_classification_task
from tasks.integration_events.fileupload_integration_events import FileUploadedIntegrationEvent

# logging.basicConfig(level=logging.DEBUG)
# logging.getLogger('aio_pika').setLevel(logging.INFO)


async def main():
    print("Subscribing to queues...")

    set_handler_dictionary({
        FileUploadedIntegrationEvent: process_file_upload_task,
        ClassificationRequestedIntegrationEvent: process_classification_task
    })

    await subscribe()

    print("Subscribed. Ready to consume...")

    try:
        await asyncio.Future()
    finally:
        consumer_connection = await get_consumer_connection()
        await consumer_connection.close()


if __name__ == "__main__":
    # asyncio.run(main())
    loop = asyncio.get_event_loop()
    loop.run_until_complete(main())
    loop.close()
