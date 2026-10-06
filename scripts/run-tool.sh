#!/bin/sh
# Runs a tool from this repository's own Yarn project while keeping the caller's working
# directory, so file arguments relative to it stay valid - including when this repository is
# checked out as a subdirectory of another project and the caller works from that project's root.
# Expects the install to be current already.
#
# Usage: scripts/run-tool.sh <tool> [args...]
set -eu

if [ $# -eq 0 ]; then
  echo "Usage: $(basename "$0") <tool> [args...]" >&2
  exit 2
fi

project_dir=$(cd "$(dirname "$0")/.." && pwd)

# Yarn sets INIT_CWD to the --cwd directory, so the caller's directory is passed separately.
# The shell runs in the project's Yarn environment, which is what resolves the tool's binary.
RUN_TOOL_CWD=$(pwd)
export RUN_TOOL_CWD
exec yarn --cwd "$project_dir" exec 'cd "$RUN_TOOL_CWD" && "$@"' "$@"
