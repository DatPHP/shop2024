#!/usr/bin/env bash
php artisan migrate --force
php artisan storage:link
php artisan key:generate --force
php artisan serve