#!/bin/bash
cd /var/www/calendario
npm install --production
pm2 restart calendario
exit
