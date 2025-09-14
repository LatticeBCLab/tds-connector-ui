# 使用官方 Node.js 镜像作为基础镜像
FROM node:22-alpine AS base

# 安装 pnpm
RUN npm install -g pnpm

# 设置工作目录
WORKDIR /app

# 复制包管理文件
COPY package.json pnpm-lock.yaml ./

# ===== 依赖安装阶段 =====
FROM base AS deps
# 安装生产和开发依赖
RUN pnpm install --frozen-lockfile

# ===== 构建阶段 =====
FROM base AS builder

# 声明构建时参数
ARG NEXT_PUBLIC_USER_DID
ARG NEXT_PUBLIC_CONNECTOR_DID
ARG NEXT_PUBLIC_TERMINAL_DID
ARG NEXT_PUBLIC_LOCATION
ARG NEXT_PUBLIC_INBOUND_RESOURCE_DATASPACE_ID

# 复制 node_modules 和源代码
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 设置环境变量（构建时不需要外部API调用）
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_USER_DID=${NEXT_PUBLIC_USER_DID}
ENV NEXT_PUBLIC_CONNECTOR_DID=${NEXT_PUBLIC_CONNECTOR_DID}
ENV NEXT_PUBLIC_TERMINAL_DID=${NEXT_PUBLIC_TERMINAL_DID}
ENV NEXT_PUBLIC_LOCATION=${NEXT_PUBLIC_LOCATION}
ENV NEXT_PUBLIC_INBOUND_RESOURCE_DATASPACE_ID=${NEXT_PUBLIC_INBOUND_RESOURCE_DATASPACE_ID}

# 构建应用
RUN pnpm build

# ===== 生产运行阶段 =====
FROM node:22-alpine AS runner
WORKDIR /app

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 安装 pnpm
RUN npm install -g pnpm

# 复制必要的文件
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 设置正确的权限
USER nextjs

# 暴露端口
EXPOSE 3000

# 设置环境变量
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED 1

# 启动应用
CMD ["node", "server.js"]