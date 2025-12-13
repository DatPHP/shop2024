FROM php:8.2-apache

# Enable Apache rewrite
RUN a2enmod rewrite

# Install system deps
RUN apt-get update && apt-get install -y \
    git unzip libzip-dev libpng-dev libonig-dev libxml2-dev \
    libpq-dev \                # <-- thêm libpq-dev cho PostgreSQL
    && docker-php-ext-install pdo_mysql mbstring zip exif pcntl \
    pdo_pgsql pgsql            # <-- thêm pdo_pgsql và pgsql

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Set working dir
WORKDIR /var/www/html

# Copy source
COPY . .

# Laravel permissions
RUN chown -R www-data:www-data storage bootstrap/cache

# Install PHP deps (không chạy key:generate)
RUN composer install --no-dev --optimize-autoloader --no-scripts

# Apache config
COPY ./docker/apache.conf /etc/apache2/sites-available/000-default.conf

EXPOSE 80
