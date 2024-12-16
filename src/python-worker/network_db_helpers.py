from typing import List

import mariadb

from connections_helper import get_maria_db_connection


def get_labels_of_network(network_id: str) -> List[str]:
    try:
        conn = get_maria_db_connection()
        cur = conn.cursor()
        cur.execute(
            f"SELECT Label FROM NetworkModelLabel "
            f"WHERE NetworkModelId=? ORDER BY `Index` ASC",
            (network_id,)
        )
        labels = [x[0] for x in cur.fetchall()]
        return labels

    except mariadb.Error:
        print("An error occurred connecting to the database...")
        raise
