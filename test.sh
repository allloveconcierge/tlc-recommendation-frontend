#!/bin/bash
set -a # automatically export all variables
source .env
set +a

poetry run pytest
