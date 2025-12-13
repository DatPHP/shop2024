FROM php:8.2-apache

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git unzip libzip-dev libonig-dev libpng-dev \
    && docker-php-ext-install pdo_mysql zip mbstring exif pcntl

# Enable Apache rewrite
RUN a2enmod rewrite

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy source
COPY . .

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader

# Laravel permissions
RUN chown -R www-data:www-data storage bootstrap/cache

# Apache config
ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
RUN sed -ri -e 's!/var/www/html!/var/www/html/public!g' /etc/apache2/sites-available/*.conf

EXPOSE 80
