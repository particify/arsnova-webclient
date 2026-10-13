#!/bin/sh
# Runs a tool from this repository's own Yarn project, so the tool and everything it loads come
# from this repository's install alone - including when this repository is checked out as a
# subdirectory of another project and the caller works from that project's root.
# Expects the install to be current already.
#
# The tool runs with this repository as its working directory. Each argument naming a path that
# exists relative to the caller's directory is passed as an absolute path; all others are passed
# unchanged. So a path given as --option=path or as a glob stays relative to this repository, and
# an argument that merely matches a file name in the caller's directory is translated too.
#
# Usage: scripts/run-tool.sh <tool> [args...]
set -eu

if [ $# -eq 0 ]; then
  echo "Usage: $(basename "$0") <tool> [args...]" >&2
  exit 2
fi

project_dir=$(cd "$(dirname "$0")/.." && pwd)
caller_dir=$(pwd)

tool=$1
shift
count=$#
while [ "$count" -gt 0 ]; do
  arg=$1
  shift
  case $arg in
    /*) ;;
    *) if [ -e "$caller_dir/$arg" ]; then arg=$caller_dir/$arg; fi ;;
  esac
  set -- "$@" "$arg"
  count=$((count - 1))
done

exec yarn --cwd "$project_dir" exec '"$@"' "$tool" "$@"
