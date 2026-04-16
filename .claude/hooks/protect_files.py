import json, sys, os

PROTECTED = [
    "**/RatioKit.scss",
    "scss/*",
    "config/production.yml"
]

payload = json.load(sys.stdin)
tool_input = payload.get("tool_input", {})
path = tool_input.get("file_path", "")

# 絶対パスに変換して比較
project_root = os.getcwd()
abs_path = os.path.abspath(path)

protected_abs = [os.path.join(project_root, p) for p in PROTECTED]

if abs_path in protected_abs:
    print(f"BLOCKED: {path} は編集禁止ファイルです")
    sys.exit(2)