#!/bin/bash
# RUNS A PYTHON HTTP SERVER ON PORT 8000
python -m http.server 8000 & \
lt --port 8000 --subdomain link-library && fg
