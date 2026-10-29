FROM ubuntu:26.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
      bash \
      curl \
      jq \
      git \
      bc \
      ca-certificates \
      xz-utils \
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

# shellcheck pinned + checksum-verified (GitHub release asset digests): the
# `ralph.sh: passes shellcheck -S error` test must run, not be skipped.
ARG SHELLCHECK_VERSION=v0.11.0
RUN arch="$(dpkg --print-architecture)" \
    && case "$arch" in \
         amd64) sc_arch=x86_64; sum=8c3be12b05d5c177a04c29e3c78ce89ac86f1595681cab149b65b97c4e227198 ;; \
         arm64) sc_arch=aarch64; sum=12b331c1d2db6b9eb13cfca64306b1b157a86eb69db83023e261eaa7e7c14588 ;; \
         *) echo "unsupported arch: $arch" >&2; exit 1 ;; \
       esac \
    && curl -fsSL -o /tmp/shellcheck.tar.xz \
         "https://github.com/koalaman/shellcheck/releases/download/${SHELLCHECK_VERSION}/shellcheck-${SHELLCHECK_VERSION}.linux.${sc_arch}.tar.xz" \
    && echo "${sum}  /tmp/shellcheck.tar.xz" | sha256sum -c - \
    && tar -xJf /tmp/shellcheck.tar.xz -C /tmp \
    && install -m 0755 "/tmp/shellcheck-${SHELLCHECK_VERSION}/shellcheck" /usr/local/bin/shellcheck \
    && rm -rf /tmp/shellcheck.tar.xz "/tmp/shellcheck-${SHELLCHECK_VERSION}" \
    && shellcheck --version

WORKDIR /workspace

CMD ["bats", "--recursive", "tests/e2e/tools/"]
