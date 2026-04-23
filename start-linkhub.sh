#!/bin/zsh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
FRONTEND_DIR="$ROOT_DIR/linkhub-frontend"
BACKEND_DIR="$ROOT_DIR/linkhub-server"
RUNTIME_DIR="$ROOT_DIR/.linkhub-runtime"
BACKEND_PID_FILE="$RUNTIME_DIR/backend.pid"
FRONTEND_PID_FILE="$RUNTIME_DIR/frontend.pid"
BACKEND_LOG="$RUNTIME_DIR/backend.log"
FRONTEND_LOG="$RUNTIME_DIR/frontend.log"
BACKEND_PORT=3001
FRONTEND_PORT=5173

mkdir -p "$RUNTIME_DIR"

info() {
  printf '%s\n' "$1"
}

fail() {
  printf '%s\n' "$1" >&2
  exit 1
}

command_exists() {
  command -v "$1" >/dev/null 2>&1
}

ensure_dependencies() {
  command_exists node || fail "Node.js 未安装，无法启动 LinkHub。"
  command_exists npm || fail "npm 未安装，无法启动 LinkHub。"
  command_exists curl || fail "curl 未安装，无法执行健康检查。"
  command_exists lsof || fail "lsof 未安装，无法检测端口占用。"
}

ensure_project_layout() {
  [ -d "$FRONTEND_DIR" ] || fail "前端目录不存在：$FRONTEND_DIR"
  [ -d "$BACKEND_DIR" ] || fail "后端目录不存在：$BACKEND_DIR"
}

ensure_env_file() {
  if [ ! -f "$BACKEND_DIR/.env" ] && [ -f "$BACKEND_DIR/.env.example" ]; then
    cp "$BACKEND_DIR/.env.example" "$BACKEND_DIR/.env"
    info "已自动创建 linkhub-server/.env"
  fi
}

ensure_node_modules() {
  if [ ! -d "$BACKEND_DIR/node_modules" ]; then
    info "安装后端依赖..."
    (cd "$BACKEND_DIR" && npm install)
  fi

  if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
    info "安装前端依赖..."
    (cd "$FRONTEND_DIR" && npm install)
  fi
}

pid_is_running() {
  local pid="$1"
  [ -n "$pid" ] && kill -0 "$pid" >/dev/null 2>&1
}

cleanup_stale_pid() {
  local pid_file="$1"
  if [ -f "$pid_file" ]; then
    local pid
    pid="$(cat "$pid_file" 2>/dev/null || true)"
    if ! pid_is_running "$pid"; then
      rm -f "$pid_file"
    fi
  fi
}

port_listener_pid() {
  lsof -ti tcp:"$1" -sTCP:LISTEN 2>/dev/null | head -n 1
}

ensure_port_available() {
  local port="$1"
  local pid_file="$2"
  cleanup_stale_pid "$pid_file"

  local running_pid=""
  if [ -f "$pid_file" ]; then
    running_pid="$(cat "$pid_file" 2>/dev/null || true)"
    if pid_is_running "$running_pid"; then
      fail "检测到 LinkHub 已在运行（PID: $running_pid，端口: $port）。请先执行 ./stop-linkhub.sh"
    fi
  fi

  local listener_pid=""
  listener_pid="$(port_listener_pid "$port" || true)"
  if [ -n "$listener_pid" ]; then
    fail "端口 $port 已被其他进程占用（PID: $listener_pid）。请先释放端口后再启动。"
  fi
}

wait_for_url() {
  local url="$1"
  local name="$2"

  for _ in {1..40}; do
    if curl -fsS "$url" >/dev/null 2>&1; then
      info "$name 启动成功：$url"
      return 0
    fi
    sleep 1
  done

  return 1
}

capture_listener_pid() {
  local port="$1"
  local pid_file="$2"
  local pid=""
  pid="$(port_listener_pid "$port" || true)"
  if [ -n "$pid" ]; then
    echo "$pid" >"$pid_file"
  fi
}

start_backend() {
  ensure_port_available "$BACKEND_PORT" "$BACKEND_PID_FILE"
  info "启动后端..."
  (
    cd "$BACKEND_DIR"
    npm run dev >"$BACKEND_LOG" 2>&1 < /dev/null &!
    sleep 1
  )

  if ! wait_for_url "http://localhost:$BACKEND_PORT/api/health" "后端"; then
    fail "后端启动失败。请查看日志：$BACKEND_LOG"
  fi
  capture_listener_pid "$BACKEND_PORT" "$BACKEND_PID_FILE"
}

start_frontend() {
  ensure_port_available "$FRONTEND_PORT" "$FRONTEND_PID_FILE"
  info "启动前端..."
  (
    cd "$FRONTEND_DIR"
    npm run dev >"$FRONTEND_LOG" 2>&1 < /dev/null &!
    sleep 1
  )

  if ! wait_for_url "http://localhost:$FRONTEND_PORT" "前端"; then
    fail "前端启动失败。请查看日志：$FRONTEND_LOG"
  fi
  capture_listener_pid "$FRONTEND_PORT" "$FRONTEND_PID_FILE"
}

show_summary() {
  local backend_pid=""
  local frontend_pid=""
  backend_pid="$(cat "$BACKEND_PID_FILE" 2>/dev/null || true)"
  frontend_pid="$(cat "$FRONTEND_PID_FILE" 2>/dev/null || true)"

  info ""
  info "LinkHub 已启动"
  info "前端: http://localhost:$FRONTEND_PORT/dashboard"
  info "后端: http://localhost:$BACKEND_PORT"
  info "健康检查: http://localhost:$BACKEND_PORT/api/health"
  info "后端 PID: ${backend_pid:-unknown}"
  info "前端 PID: ${frontend_pid:-unknown}"
  info "日志目录: $RUNTIME_DIR"
  info "停止命令: ./stop-linkhub.sh"
}

main() {
  info "启动 LinkHub..."
  ensure_dependencies
  ensure_project_layout
  ensure_env_file
  ensure_node_modules
  start_backend
  start_frontend
  show_summary
}

main "$@"
