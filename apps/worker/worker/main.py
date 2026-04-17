import os
import time


def run() -> None:
    redis_host = os.getenv("REDIS_HOST", "redis")
    postgres_host = os.getenv("POSTGRES_HOST", "db")
    print(f"[worker] booting with redis={redis_host}, postgres={postgres_host}")

    while True:
        print("[worker] idle heartbeat")
        time.sleep(10)


if __name__ == "__main__":
    run()
