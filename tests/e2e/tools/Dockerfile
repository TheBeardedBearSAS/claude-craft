FROM ubuntu:26.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
      bash \
      curl \
      jq \
      git \
      bc \
      ca-certificates \
    && git clone --depth 1 --branch v1.11.1 https://github.com/bats-core/bats-core.git /opt/bats-core \
    && /opt/bats-core/install.sh /usr/local \
    && rm -rf /opt/bats-core \
    && rm -rf /var/lib/apt/lists/*

# yq (mikefarah) pinned + checksum-verified: Ralph reads ralph.yml and merges
# parallel worker reports with it, so the e2e suite must exercise those paths.
ARG YQ_VERSION=v4.45.1
RUN arch="$(dpkg --print-architecture)" \
    && case "$arch" in \
         amd64) sum=654d2943ca1d3be2024089eb4f270f4070f491a0610481d128509b2834870049 ;; \
         arm64) sum=ceea73d4c86f2e5c91926ee0639157121f5360da42beeb8357783d79c2cc6a1d ;; \
         *) echo "unsupported arch: $arch" >&2; exit 1 ;; \
       esac \
    && curl -fsSL -o /usr/local/bin/yq \
         "https://github.com/mikefarah/yq/releases/download/${YQ_VERSION}/yq_linux_${arch}" \
    && echo "${sum}  /usr/local/bin/yq" | sha256sum -c - \
    && chmod +x /usr/local/bin/yq \
    && yq --version

WORKDIR /workspace

CMD ["bats", "--recursive", "tests/e2e/tools/"]
