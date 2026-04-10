# 🚀 莱昂脉冲：一键全弹发射（支持自定义备注）
function gp() {
  git add .
  # 如果你输入了备注，就用你的；如果没输，就用默认的
  if [ -z "$1" ]; then
    git commit -m "战术终端升级"
  else
    git commit -m "$1"
  fi
  git push
}