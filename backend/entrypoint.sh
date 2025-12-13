#!/bin/sh
set -e

# 1. Generate app key nếu chưa có
php artisan key:generate --force

# 2. Chạy migration
php artisan migrate --force

# 3. Chạy seeder (nếu có)
php artisan db:seed --force

# 4. Start Apache
apache2-foreground
