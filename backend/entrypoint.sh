#!/bin/sh
set -e

# 1. Generate app key nếu chưa có

# 2. Chạy migration
php artisan migrate --force

# 3. Chạy seeder (nếu có)
php artisan db:seed --force

# 4. Start Apache
apache2-foreground
