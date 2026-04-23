#!/bin/zsh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
RUNTIME_DIR="$ROOT_DIR/.linkhub-runtime"
BACKEND_PID_FILE="$RUNTIME_DIR/backend.pid"
FRONTEND_PID_FILE="$RUNTIME_DIR/frontend.pid"
BACKEND_PORT=3001
FRONTEND_PORT=5173

info() {
  printf '%s\n' "$1"
}

pid_is_running() {
  local pid="$1"
  [ -n "$pid" ] && kill -0 "$pid" >/dev/null 2>&1
}

stop_by_pid_file() {
  local label="$1"
  local pid_file="$2"

  if [ ! -f "$pid_file" ]; then
    info "$label 未发现 PID 文件。"
    return 0
  fi

  local pid
  pid="$(cat "$pid_file" 2>/dev/null || true)"

  if pid_is_running "$pid"; then
    kill "$pid" >/dev/null 2>&1 || true
    for _ in {1..10}; do
      if ! pid_is_running "$pid"; then
        break
      fi
      sleep 1
    done
    if pid_is_running "$pid"; then
      kill -9 "$pid" >/dev/null 2>&1 || true
    fi
    info "$label 已停止（PID: $pid）"
  else
    info "$label PID 文件已清理。"
  fi

  rm -f "$pid_file"
}

stop_by_port() {
  local label="$1"
  local port="$2"
  local pid
  pid="$(lsof -ti tcp:"$port" -sTCP:LISTEN 2>/dev/null | head -n 1 || true)"
  if [ -n "$pid" ]; then
    kill "$pid" >/dev/null 2>&1 || true
    sleep 1
    if kill -0 "$pid" >/dev/null 2>&1; then
      kill -9 "$pid" >/dev/null 2>&1 || true
    fi
    info "$label 端口占用进程已清理（PID: $pid）"
  fi
}

main() {
  info "停止 LinkHub..."
  stop_by_pid_file "后端" "$BACKEND_PID_FILE"
  stop_by_pid_file "前端" "$FRONTEND_PID_FILE"
  stop_by_port "后端" "$BACKEND_PORT"
  stop_by_port "前端" "$FRONTEND_PORT"
  info "LinkHub 已停止。"
}

main "$@"
