# About

This repository is just for learning React19 and Kysely. So, theres nothing special.

## React19

What I checked

- meta tags
- form, useActionState

## Kysely or Express

- singed cookie, which I've never used it.

## Python

1. Create virtual environment  
   `python -m venv embedding-env`

2. Activate virtual environment  
   `source embedding-eenv/bin/activate`

3. Install libraries  
   `pip install -r requirements.txt`

4. Start FastAPI server. This may take a long time  
   `fastapi dev main.py`

## Postgres

extensions

- pg_bigrm
- pg_vector

```
CREATE EXTENSION IF NOT EXISTS vector;

CREATE EXTENSION IF NOT EXISTS pg_bigm;
```

```
CREATE TABLE todos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    text_vector VECTOR(1024) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX documents_title_content_bigm_idx
ON todos
USING gin (
    (title || ' ' || content) gin_bigm_ops
);
```
