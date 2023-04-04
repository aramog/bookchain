#!/bin/bash
# SCRIPT WILL START THE ADAPTER SERVER
python app.py & \ # will run flask server that runs RFID interface
lt --port 1337 --subdomain link-adapter && fg # localtunnel to expose flask server
