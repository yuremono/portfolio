import json, sys, os

PROTECTED = [
    "**/RatioKit.scss",
    "scss/*",
    "config/production.yml"
]

payload = json.load(sys.stdin)
tool_input = payload.get("tool_input", {})
path = tool_input.get("file_path", "")

# 絶対パスに変換して比較。project_rootはこのスクリプト自身の場所(.claude/hooks/)から
# 逆算する(cwdに依存すると、rag-backend/等のサブディレクトリに移動した状態で
# 編集した際にproject_rootがずれてパス比較が常に不一致になり、フックが機能しない)。
project_root = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
abs_path = os.path.abspath(path)

protected_abs = [os.path.join(project_root, p) for p in PROTECTED]

if abs_path in protected_abs:
    print(f"BLOCKED: {path} は編集禁止ファイルです")
    sys.exit(2)