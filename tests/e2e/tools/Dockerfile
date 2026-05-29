FROM ubuntu:26.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
      bash \
      curl \
      jq \
      git \
      bc \
      ca-certificates \
    && git clone --depth 1 https://github.com/bats-core/bats-core.git /opt/bats-core \
    && /opt/bats-core/install.sh /usr/local \
    && rm -rf /opt/bats-core \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace

CMD ["bats", "--recursive", "tests/e2e/tools/"]
