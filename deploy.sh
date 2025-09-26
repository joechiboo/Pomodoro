#!/bin/bash

# 快速部署腳本 - 一鍵部署到 GitHub Pages
# 使用方法: ./deploy.sh 或 bash deploy.sh

echo "🚀 開始部署到 GitHub Pages..."

# 檢查是否有未提交的變更
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  發現未提交的變更，正在提交..."
    git add .
    read -p "請輸入提交訊息 (按 Enter 使用預設訊息): " commit_msg
    if [ -z "$commit_msg" ]; then
        commit_msg="Update project files before deployment"
    fi
    git commit -m "$commit_msg"
    git push origin main
    echo "✅ 變更已提交並推送到 main 分支"
fi

# 建置並部署
echo "📦 正在建置專案..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ 建置成功"
    echo "🌐 正在部署到 GitHub Pages..."
    npx gh-pages -d dist

    if [ $? -eq 0 ]; then
        echo "🎉 部署成功！"
        echo "📱 你的應用將在幾分鐘內在以下網址上線:"
        echo "   https://$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^/]*\)\/\([^.]*\).*/\1.github.io\/\2/')/"
    else
        echo "❌ 部署失敗"
        exit 1
    fi
else
    echo "❌ 建置失敗"
    exit 1
fi