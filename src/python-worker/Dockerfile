FROM python:3.6
WORKDIR /app

COPY requirements.txt requirements.txt
RUN apt-get update &&  \
    apt-get upgrade -y && \
    apt-get install --no-install-recommends -yy  \
      libmariadb-dev  \
      libsndfile1-dev  \
      libsndfile1  \
      libmp3lame-dev \
      libmpg123-dev  \
      ffmpeg && \
    rm -rf /var/lib/apt/lists/* && \
    apt-get purge --auto-remove && \
    apt-get clean


RUN pip3 install --no-cache-dir -r requirements.txt

COPY ./ .

ENV WAIT_VERSION 2.7.2
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/$WAIT_VERSION/wait /wait
RUN chmod +x /wait

ENTRYPOINT ["python3", "-u", "consumer.py"]
