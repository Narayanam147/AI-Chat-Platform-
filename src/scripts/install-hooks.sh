#!/bin/sh
echo "Setting local git hooks path to .githooks"
git config core.hooksPath .githooks
if [ $? -ne 0 ]; then
  echo "Failed to set core.hooksPath" >&2
  exit 1
fi
echo "Hooks installed. Pre-push will prompt for confirmation on push."
