import os
import json

def get_directory_tree(path, root_dir):
    tree = {
        "name": os.path.basename(path),
        "isDir": True,
        "children": []
    }
    
    try:
        items = os.listdir(path)
        items.sort()
        for item in items:
            if item.startswith('.') or item == 'node_modules' or item == 'dashboard-carioca':
                continue
            
            full_path = os.path.join(path, item)
            rel_path = os.path.relpath(full_path, root_dir).replace('\\', '/')
            
            if os.path.isdir(full_path):
                tree["children"].append(get_directory_tree(full_path, root_dir))
            else:
                ext = os.path.splitext(item)[1].lower()
                tree["children"].append({
                    "name": item,
                    "isDir": False,
                    "path": rel_path,
                    "ext": ext
                })
    except Exception as e:
        print(f"Error reading {path}: {e}")
        
    return tree

root = r"c:\Users\md\Desktop\Programadores-Cariocas"
result = []
modules = [d for d in os.listdir(root) if os.path.isdir(os.path.join(root, d)) and d.startswith('Módulo')]
modules.sort()

for module in modules:
    result.append(get_directory_tree(os.path.join(root, module), root))

# Write to the prospective dashboard folder
output_json = os.path.join(root, "dashboard-carioca/src/data.json")
with open(output_json, "w", encoding='utf-8') as f:
    json.dump(result, f, indent=2, ensure_ascii=False)

# Generator for README Markdown
def generate_markdown(nodes, indent=0):
    md = ""
    for node in nodes:
        if node["isDir"]:
            md += f"{'  ' * indent}- <details>\n"
            md += f"{'  ' * indent}  <summary>📂 <b>{node['name']}</b></summary>\n\n"
            md += generate_markdown(node["children"], indent + 1)
            md += f"\n{'  ' * indent}</details>\n"
        else:
            icon = "📄"
            if node["ext"] == ".pdf": icon = "📕"
            if node["ext"] == ".pptx" or "Slides" in node["name"]: icon = "🖥️"
            md += f"{'  ' * indent}- {icon} [{node['name']}]({node['path'].replace(' ', '%20')})\n"
    return md

readme_md = generate_markdown(result)

# Read the current README to keep the header/footer
readme_path = os.path.join(root, "README.md")
with open(readme_path, "r", encoding='utf-8') as f:
    current_content = f.read()

# Replace the module structure section
start_marker = "## 📁 Estrutura do Repositório"
end_marker = "## 🛠️ Desenvolvimento do Painel"

if start_marker in current_content and end_marker in current_content:
    parts = current_content.split(start_marker)
    header = parts[0] + start_marker + "\n\nExplore os arquivos abaixo de forma expansível:\n\n"
    footer = end_marker + current_content.split(end_marker)[1]
    new_content = header + readme_md + "\n\n" + footer
    
    with open(readme_path, "w", encoding='utf-8') as f:
        f.write(new_content)

print(f"Generated file list and updated README interactive section.")
