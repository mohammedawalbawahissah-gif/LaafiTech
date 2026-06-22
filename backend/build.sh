#!/usr/bin/env bash
set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --no-input

# Create laafitech schema if it doesn't exist
python - <<'EOF'
import os, psycopg2
conn = psycopg2.connect(
    dbname=os.environ['DB_NAME'],
    user=os.environ['DB_USER'],
    password=os.environ['DB_PASSWORD'],
    host=os.environ['DB_HOST'],
    port=os.environ.get('DB_PORT', '5432'),
)
conn.autocommit = True
cur = conn.cursor()
cur.execute("CREATE SCHEMA IF NOT EXISTS laafitech;")
cur.close()
conn.close()
print("Schema laafitech ready.")
EOF

python manage.py migrate