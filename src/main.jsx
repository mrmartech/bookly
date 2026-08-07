import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BookOpen, Boxes, ChevronDown, Circle as CircleHelp, CloudUpload, Copy, Download, FileCode as FileCode2, FileText, Folder, FolderOpen, GitBranch, Hop as Home, Menu, MoveVertical as MoreVertical, Plus, Settings, Sparkles, Terminal, Upload, WandSparkles, X } from 'lucide-react';
import './styles.css';

const steps = ['Parsing', 'Extracting Text', 'Analyzing Structure', 'Distilling Chapters', 'Assembling SKILL.md'];
const files = ['ch01-introduction.md', 'ch02-clean-code-mindset.md', 'ch03-naming-things.md', 'ch04-functions.md', 'ch05-comments.md'];

function App() {
  const [mode, setMode] = useState('text');
  const [activeFile, setActiveFile] = useState('SKILL.md');
  const [processing, setProcessing] = useState(true);
  const [terminalOpen, setTerminalOpen] = useState(true);
  const [mobileNav, setMobileNav] = useState(false);
  const [toast, setToast] = useState('');
  const showToast = (message) => { setToast(message); window.setTimeout(() => setToast(''), 2600); };
  const startOver = () => { setProcessing(true); showToast('New private workspace ready'); };

  return <div className="app-shell">
    <aside className={mobileNav ? 'sidebar open' : 'sidebar'}>
      <div className="brand"><div className="brand-mark"><WandSparkles size={19}/></div><div><b>book-to-skill</b><span>Studio</span></div><button className="close-nav" onClick={() => setMobileNav(false)}><X size={18}/></button></div>
      <nav>
        <a className="active"><Home size={16}/>Studio</a><a><Folder size={16}/>Projects</a><a><Boxes size={16}/>Templates</a><a><BookOpen size={16}/>Skills Hub</a><a><Settings size={16}/>Settings</a>
      </nav>
      <div className="booklin"><div className="wizard">🧙</div><b>Booklin</b><small>Your helpful skill wizard</small></div>
      <div className="side-bottom"><div className="open-source"><GitBranch size={16}/><b>book-to-skill</b><small>Open source</small><div><span>★ 18.7k</span><span>◒ 12.4k</span></div></div><div className="profile"><div className="avatar">D</div><div><b>devcraft</b><small>Pro Plan</small></div><ChevronDown size={15}/></div></div>
    </aside>

    <main>
      <header className="topbar"><button className="hamburger" onClick={() => setMobileNav(true)}><Menu size={20}/></button><div></div><div className="efficiency"><b>24×–51×</b><span>Token Efficiency</span></div><button className="icon-btn"><BookOpen size={19}/></button><button className="icon-btn"><Sparkles size={19}/></button></header>
      <section className="hero"><div><p className="eyebrow">PRIVATE SKILL WORKSPACE</p><h1>Turn any book or docs folder<br/>into an <em>AI skill in seconds</em></h1><p>book-to-skill distills books, docs, and papers into structured,<br/>agent-ready skills that are <strong>24×–51×</strong> more token efficient.</p></div><div className="hero-art"><div className="spark one"></div><div className="spark two"></div><div className="doc-chip pdf">PDF</div><div className="doc-chip md">MD</div><div className="doc-chip folder-chip"><Folder size={25}/></div><div className="open-book">⌁</div></div></section>

      <section className="panel ingest"><h2><span>1.</span> Ingest Your Source</h2><button className="dropzone" onClick={() => showToast('Your files stay private in this workspace')}><CloudUpload size={37}/><b>Drag & drop a book, document, or folder here</b><span>or click to browse</span><div className="format-list">{['PDF','EPUB','DOCX','MD','HTML','RTF','Folder'].map(x => <i key={x}>{x}</i>)}</div></button><div className="config-grid"><label>Skill Name <div className="input">clean-code-handbook <b>✓</b></div><small>Auto-slug: clean-code-handbook</small></label><div className="config-item">Extraction Mode <CircleHelp size={13}/><div className="toggle"><button className={mode==='text'?'chosen':''} onClick={() => setMode('text')}><b>Text-heavy (Fast)</b><small>pdftotext / pypdf</small></button><button className={mode==='tech'?'chosen':''} onClick={() => setMode('tech')}><b>Technical (Best)</b><small>Docling (tables, code)</small></button></div></div><label>Target Host <div className="input host"><span className="host-icon">✦</span><div><b>Claude Code</b><small>~/.claude/skills</small></div><ChevronDown size={16}/></div><small>Supports Claude, Copilot, Amp & more</small></label></div></section>

      <section className="panel processing"><h2><span>2.</span> Processing Your Source</h2><div className="steps">{steps.map((step, i) => <div className={'step '+(i < 2 && processing ? 'done':'')+(i===1&&processing?' current':'')} key={step}><div>{i < 1 && processing ? '✓':i+1}</div><b>{step}</b></div>)}</div>{terminalOpen && <div className="terminal"><div className="terminal-title"><span>Live Terminal Output <i></i> Streaming</span><button onClick={() => setTerminalOpen(false)}>Collapse <ChevronDown size={13}/></button></div><pre>{`10:21:34  [info]  Starting extraction with pdftotext (fast mode)
10:21:35  [info]  Reading file: Clean_Code_Handbook.pdf (24.8 MB)
10:21:37  [info]  Extracted 315 pages
10:21:39  [info]  Estimated tokens (raw): 1,248,531
10:21:40  [info]  Cleaning and normalizing text...
10:21:42  [info]  Detecting document structure...
10:21:45  [info]  Found 18 chapters, 3 appendices, 1 index
10:21:47  [info]  Distilling key concepts and patterns...
10:21:53  [info]  Compression target: 24× – 51×
10:21:53  [info]  Estimated final tokens: ~48,200 (25.9× reduction)`}</pre></div>}{!terminalOpen && <button className="reopen" onClick={() => setTerminalOpen(true)}><Terminal size={15}/> Show live terminal output</button>}</section>

      <section className="studio"><div className="panel inspector"><h2><span>3.</span> Skill Inspector & Preview Studio</h2><div className="preview-grid"><aside className="file-tree"><div className="tree-head"><b>Skill Files</b><small>6 files</small></div><button className={'tree-main '+(activeFile==='SKILL.md'?'selected':'')} onClick={() => setActiveFile('SKILL.md')}><FileText size={16}/> SKILL.md <MoreVertical size={15}/></button><div className="folder-line"><ChevronDown size={14}/><FolderOpen size={15}/> chapters/ <small>18</small></div>{files.map(file => <button key={file} className={activeFile===file?'selected':''} onClick={() => setActiveFile(file)}><FileCode2 size={14}/>{file}</button>)}<button onClick={() => setActiveFile('glossary.md')}><FileText size={15}/>glossary.md</button><button onClick={() => setActiveFile('patterns.md')}><FileText size={15}/>patterns.md</button><button onClick={() => setActiveFile('cheatsheet.md')}><FileText size={15}/>cheatsheet.md</button></aside><article className="markdown"><div className="tabs"><button><FileText size={13}/>{activeFile}<X size={12}/></button><button>ch01-introduction.md <X size={12}/></button><button>patterns.md <X size={12}/></button><button className="plus"><Plus size={17}/></button></div><div className="doc"><h3># Clean Code Handbook</h3><p>A practical guide to writing clean, maintainable, and efficient code.</p><h4>## Core Mental Models</h4><ul><li>Code is read far more often than it is written.</li><li>Meaningful names reveal intent.</li><li>Functions should do one thing, and do it well.</li><li>Comments explain why, not what.</li><li>Design for change, not for perfection.</li></ul><h4>## Chapters</h4><div className="chapter-table"><div><b>Chapter</b><b>Title</b><b>Focus</b></div>{[['01','Introduction','What is Clean Code?'],['02','Clean Code Mindset','The philosophy behind clean code'],['03','Naming Things','Choose names that reveal intent'],['04','Functions','Small, focused, intention-revealing'],['05','Comments','Use comments to clarify, not clutter'],['18','Conclusion','Key takeaways and next steps']].map(row=><div key={row[0]}>{row.map(c=><span key={c}>{c}</span>)}</div>)}</div><blockquote>› This skill distills the key insights from the book into actionable guidance optimized for AI agents and developers.</blockquote></div></article></div></div><aside className="right-rail"><div className="panel stats"><h2>Token & Stats</h2><div className="donut"><div><b>~48.2k</b><span>tokens</span></div></div><dl><div><dt>Raw (Estimated)</dt><dd>1,248,531</dd></div><div><dt>Final (Estimated)</dt><dd>~48,200</dd></div><div><dt>Compression</dt><dd className="green">25.9×</dd></div><div><dt>Chapters</dt><dd>18</dd></div><div><dt>Files</dt><dd>6</dd></div></dl><p>Patterns <b>27</b></p><strong>Great compression!</strong></div><div className="panel export"><h2><span>4.</span> Export & Install</h2><button className="primary" onClick={() => showToast('Your private ZIP download is ready')}><Download size={16}/>Download ZIP<small>Get skill as a .zip package</small></button><button onClick={() => showToast('Install command copied to clipboard')}><Copy size={16}/>Copy Install Command</button><button disabled><CloudUpload size={16}/>Save to Cloud (Soon)<small>Coming soon</small></button></div></aside></section>
      <footer><div>Project: <b>clean-code-handbook</b><span className="complete">● Completed</span></div><div>Total Tokens <b>~48,200</b></div><div>Compression <b className="green">25.9×</b></div><div>Chapters <b>18</b></div><div>Files <b>6</b></div><div className="time">◷ <span>Processing Time<br/><b>00:00:52</b></span></div></footer>
    </main>{toast && <div className="toast">{toast}</div>}</div>
}
createRoot(document.getElementById('root')).render(<App/>);
