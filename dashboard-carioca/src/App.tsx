import React, { useState, useMemo } from 'react';
import data from './data.json';

interface FileNode {
  name: string;
  isDir: boolean;
  children?: FileNode[];
  path?: string;
  ext?: string;
}

const IconPDF = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M9 13v-3h3a2 2 0 0 1 0 4H9Z"/><path d="M12 17h1"/><path d="M15 13v4"/></svg>
);

const IconFolder = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>
);

const IconFile = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
);

const IconSearch = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
);

const App: React.FC = () => {
  const [currentModuleIndex, setCurrentModuleIndex] = useState<number>(0);
  const [navPath, setNavPath] = useState<FileNode[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const currentModule = data[currentModuleIndex] as FileNode;
  
  const currentLevel = useMemo(() => {
    if (navPath.length === 0) return currentModule.children || [];
    const lastNode = navPath[navPath.length - 1];
    return lastNode.children || [];
  }, [currentModule, navPath]);

  const filteredItems = useMemo(() => {
    if (!searchQuery) return currentLevel;
    
    // Recursive search across all modules
    const results: FileNode[] = [];
    const search = (nodes: FileNode[]) => {
      for (const node of nodes) {
        if (node.name.toLowerCase().includes(searchQuery.toLowerCase())) {
          results.push(node);
        }
        if (node.children) search(node.children);
      }
    };
    
    // Search only in CURRENT module if search is active but not global?? 
    // Let's do global search if searchQuery exists
    const allItems: FileNode[] = [];
    data.forEach(m => allItems.push(...(m.children || [])));
    search(allItems);
    return results;
  }, [currentLevel, searchQuery]);

  const handleOpen = (node: FileNode) => {
    if (node.isDir) {
      setNavPath([...navPath, node]);
    } else if (node.path) {
      // In production built at root, path is correct relative to index.html
      // In dev mode, we might need a prefix
      const prefix = ""; // Adjust if needed
      window.open(prefix + node.path, '_blank');
    }
  };

  const goBack = (index: number) => {
    if (index === -1) {
      setNavPath([]);
    } else {
      setNavPath(navPath.slice(0, index + 1));
    }
    setSearchQuery("");
  };

  const changeModule = (idx: number) => {
    setCurrentModuleIndex(idx);
    setNavPath([]);
    setSearchQuery("");
  };

  const getFileIcon = (node: FileNode) => {
    if (node.isDir) return { icon: <IconFolder />, class: "icon-dir" };
    if (node.ext === ".pdf") return { icon: <IconPDF />, class: "icon-pdf" };
    if (node.ext === ".pptx" || node.name.toLowerCase().includes("slides")) return { icon: <IconPDF />, class: "icon-slide" };
    return { icon: <IconFile />, class: "icon-file" };
  };

  return (
    <>
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-icon">PC</div>
          <div className="logo-text">Programadores Cariocas</div>
        </div>
        
        <nav className="nav-section">
          <h3 className="nav-title">Módulos do Curso</h3>
          {data.map((module, idx) => (
            <div 
              key={module.name} 
              className={`nav-item ${currentModuleIndex === idx && navPath.length === 0 ? 'active' : ''}`}
              onClick={() => changeModule(idx)}
            >
              <IconFolder />
              {module.name.replace('Módulo ', 'M.')}
            </div>
          ))}
        </nav>
      </aside>

      <main className="main">
        <header className="top-bar">
          <div className="search-container">
            <span className="search-icon"><IconSearch /></span>
            <input 
              type="text" 
              className="search-input" 
              placeholder="Pesquisar arquivos e slides..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </header>

        <section className="content-area">
          <div className="header-row">
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span onClick={() => goBack(-1)} className="breadcrumb-item">{currentModule.name}</span>
                {navPath.map((p, i) => (
                  <React.Fragment key={i}>
                    <span>/</span>
                    <span onClick={() => goBack(i)} className="breadcrumb-item">{p.name}</span>
                  </React.Fragment>
                ))}
              </div>
              <h1 className="page-title">
                {searchQuery ? `Resultados para "${searchQuery}"` : (navPath.length > 0 ? navPath[navPath.length - 1].name : currentModule.name)}
              </h1>
            </div>
          </div>

          <div className="file-grid">
            {filteredItems.map((item, idx) => {
              const { icon, class: iconClass } = getFileIcon(item);
              return (
                <div 
                  key={idx} 
                  className="file-card animate-in" 
                  style={{ animationDelay: `${idx * 0.05}s` }}
                  onClick={() => handleOpen(item)}
                >
                  <div className={`file-icon-box ${iconClass}`}>
                    {icon}
                  </div>
                  <div className="file-info">
                    <div className="file-name" title={item.name}>{item.name}</div>
                    <div className="file-path">{item.path || 'Pasta'}</div>
                  </div>
                  <div className="file-footer">
                    <span className="file-badge">{(item.ext || (item.isDir ? 'Folder' : 'File')).toUpperCase().replace('.', '')}</span>
                    <button className="open-btn" onClick={(e) => { e.stopPropagation(); handleOpen(item); }}>
                      {item.isDir ? 'Abrir' : 'Ver'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredItems.length === 0 && (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
              Nenhum arquivo encontrado nesta pasta.
            </div>
          )}
        </section>
      </main>
    </>
  );
};

export default App;
