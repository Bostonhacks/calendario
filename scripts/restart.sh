#!/bin/bash
cd /var/www/calendario
npm install
pm2 restart calendario
logout