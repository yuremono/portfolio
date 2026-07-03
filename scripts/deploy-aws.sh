#!/usr/bin/env bash
# AWS(S3+CloudFront / App Runner)へのデプロイをまとめる補助スクリプト。
#
# 使い方:
#   ./scripts/deploy-aws.sh frontend   # フロントのみ(S3 sync + CloudFront invalidation)
#   ./scripts/deploy-aws.sh backend    # バックエンドのみ(Docker build + ECR push + App Runner)
#   ./scripts/deploy-aws.sh all        # 両方(frontend → backend の順)
#
# 前提: aws configure 済み、rag-backend/ が存在する場合のみ backend/all を実行可能。
# RAGデータ(~/rag-data/portfolio-rag/entries/)を更新した場合は、backend実行前に
# 各自 `python3 build/build_db.py` でDBを再構築し data/portfolio.db にコピーしておくこと
# (本スクリプトは自動では行わない。詳細は portfolio-rag-progress.md 参照)。

set -euo pipefail

MODE="${1:-}"
if [[ "$MODE" != "frontend" && "$MODE" != "backend" && "$MODE" != "all" ]]; then
	echo "使い方: $0 frontend|backend|all" >&2
	exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# AWSリソース識別子はgit管理外の env ファイルから読み込む(公開リポジトリに含めない)
ENV_FILE="$ROOT_DIR/scripts/deploy-aws.env"
if [[ ! -f "$ENV_FILE" ]]; then
	echo "scripts/deploy-aws.env が見つかりません。S3_BUCKET / CLOUDFRONT_DIST_ID / ECR_REPO / APPRUNNER_SERVICE_ARN を定義してください。" >&2
	exit 1
fi
# shellcheck source=/dev/null
source "$ENV_FILE"
: "${S3_BUCKET:?}" "${CLOUDFRONT_DIST_ID:?}" "${ECR_REPO:?}" "${APPRUNNER_SERVICE_ARN:?}"

deploy_frontend() {
	echo "== フロントエンド: ビルド =="
	cd "$ROOT_DIR"
	npx tsc -b
	npx vite build --base=/

	echo "== フロントエンド: S3同期 =="
	aws s3 sync dist/ "s3://${S3_BUCKET}/" --delete

	echo "== フロントエンド: CloudFrontキャッシュ無効化 =="
	aws cloudfront create-invalidation --distribution-id "$CLOUDFRONT_DIST_ID" --paths "/*"

	echo "== フロントエンド: デプロイ完了 =="
}

deploy_backend() {
	local backend_dir="$ROOT_DIR/rag-backend"
	if [[ ! -d "$backend_dir" ]]; then
		echo "rag-backend/ が見つかりません。backendデプロイをスキップします。" >&2
		return 1
	fi

	echo "== バックエンド: OrbStack起動 =="
	open -a OrbStack
	for _ in $(seq 1 10); do
		docker info >/dev/null 2>&1 && break
		sleep 3
	done
	docker info >/dev/null 2>&1 || { echo "OrbStackの起動に失敗しました" >&2; return 1; }

	echo "== バックエンド: Dockerビルド =="
	cd "$backend_dir"
	docker build --platform linux/amd64 -t portfolio-rag:latest .

	echo "== バックエンド: ECRへpush =="
	aws ecr get-login-password --region ap-northeast-1 \
		| docker login --username AWS --password-stdin "${ECR_REPO%/*}"
	docker tag portfolio-rag:latest "${ECR_REPO}:latest"
	docker push "${ECR_REPO}:latest"

	echo "== バックエンド: App Runnerへデプロイ =="
	aws apprunner start-deployment --region ap-northeast-1 --service-arn "$APPRUNNER_SERVICE_ARN"

	echo "== バックエンド: デプロイ開始(反映まで数分。OrbStackは確認後に手動で終了すること) =="
}

case "$MODE" in
	frontend)
		deploy_frontend
		;;
	backend)
		deploy_backend
		;;
	all)
		deploy_frontend
		deploy_backend
		;;
esac
