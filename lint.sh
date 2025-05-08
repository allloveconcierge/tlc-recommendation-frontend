#!/usr/bin/env bash
pylint --rcfile=.pylintrc app tests

# Pre-checks: pre-commit
poetry run which pre-commit > /dev/null || (echo "pre-commit package not found, installing..." && brew install pre-commit)

# Run pre-commit checks
poetry run pre-commit install && poetry run pre-commit run --all-files
