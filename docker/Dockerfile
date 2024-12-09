FROM postgres:15

# 必要なパッケージをインストール
RUN apt-get update && apt-get install -y \
    git \
    postgresql-server-dev-15 \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# pg_vector のインストール
RUN git clone --branch v0.8.0 https://github.com/pgvector/pgvector.git /pgvector \
    && cd /pgvector \
    && make && make install \
    && rm -rf /pgvector

# pg_bigm のインストール
RUN git clone https://github.com/pgbigm/pg_bigm.git /pgbigm \
    && cd /pgbigm \
    && make USE_PGXS=1 PG_CONFIG=/usr/bin/pg_config && make USE_PGXS=1 PG_CONFIG=/usr/bin/pg_config install \
    && rm -rf /pgbigm