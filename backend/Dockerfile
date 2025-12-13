# Dockerfile Laravel + PostgreSQL cho Render

FROM php:8.2-apache

# Enable Apache rewrite module
RUN a2enmod rewrite

# Cài đặt hệ thống và PHP extensions cần thiết
RUN apt-get update && apt-get install -y \
    git unzip libzip-dev libpng-dev libonig-dev libxml2-dev libpq-dev \
    && docker-php-ext-install \
        pdo_mysql \
        mbstring \
        zip \
        exif \
        pcntl \
        pdo_pgsql \
        pgsql

# Cài Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy toàn bộ source code vào container
COPY . .

# Set quyền cho Laravel
RUN chown -R www-data:www-data storage bootstrap/cache

# Cài dependencies PHP mà KHÔNG chạy scripts (tránh lỗi key:generate khi .env chưa có)
RUN composer install --no-dev --optimize-autoloader --no-scripts

# Copy cấu hình Apache nếu có
# Nếu bạn không có custom apache.conf, dòng này có thể bỏ
COPY ./docker/apache.conf /etc/apache2/sites-available/000-default.conf

# Expose port 80 cho Render
EXPOSE 80

# Command khởi chạy Apache
# CMD ["apache2-foreground"]
# Copy entrypoint script vào container
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Khởi chạy container bằng entrypoint
ENTRYPOINT ["/entrypoint.sh"]
