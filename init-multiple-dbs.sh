#!/bin/bash
set -e

# Hàm tạo database và user nếu chưa tồn tại
create_database() {
    local database=$1
    echo "  Creating user and database '$database'..."
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
        SELECT 'CREATE DATABASE $database'
        WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$database')\gexec
EOSQL
}

# Danh sách các database cần tạo cho các microservices
create_database "fepa_expense"
create_database "fepa_budget"
create_database "fepa_blog"
create_database "fepa_ocr"
create_database "fepa_ai"
create_database "fepa_notification"
create_database "fepa_subscription"

echo "✅ All FEPA databases created successfully!"
