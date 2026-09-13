import re
with open(r"C:\xampp\htdocs\bikini\src\lib\admin-store.tsx", "r") as f:
    content = f.read()

lines = content.split("\n")
result = []
for i, line in enumerate(lines):
    if line.strip() == "}," and i + 1 < len(lines) and lines[i + 1].strip().startswith("{"):
        continue
    result.append(line)

with open(r"C:\xampp\htdocs\bikini\src\lib\admin-store.tsx", "w") as f:
    f.write("\n".join(result))
print("Fixed admin-store.tsx")
