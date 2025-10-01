#!/bin/sh

API_URL=${API_URL:-"http://localhost:8000"}

sed -i "s|\${API_URL}|${API_URL}|g" /opt/app/dist/config.json

exec serve -s dist -l 3000
