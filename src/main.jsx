import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import JSZip from 'jszip';
import { BookOpen, Boxes, ChevronDown, Circle as CircleHelp, CloudUpload, Copy, Download, FileCode, FileText, Folder, FolderOpen, GitBranch, Hop as Home, Menu, MoveVertical as MoreVertical, Plus, Settings, Sparkles, Terminal, Upload, WandSparkles, X } from 'lucide-react';
import './styles.css';

const steps = ['Parsing', 'Extracting Text', 'Analyzing Structure', 'Distilling Chapters', 'Assembling SKILL.md'];
const chapterFiles = ['ch01-introduction.md', 'ch02-clean-code-mindset.md', 'ch03-naming-things.md', 'ch04-functions.md', 'ch05-comments.md'];
const initialLogs = ['Workspace ready — documents remain in this browser session only.', 'Choose a source file or folder to begin a private conversion.'];
const hostChoices = { Claude: '~/.claude/skills', Copilot: '~/.copilot/skills', Amp: '~/.agents/skills' };
const fileBodies = {
  'SKILL.md': `# Clean Code Handbook\n\nA practical guide to writing clean, maintainable, and efficient code.\n\n## Core Mental Models\n\n- Code is read far more often than it is written.\n- Meaningful names reveal intent.\n- Functions should do one thing, and do it well.\n- Comments explain why, not what.\n- Design for change, not perfection.\n\n## Chapters\n\n| Chapter | Title | Focus |\n| --- | --- | --- |\n| 01 | Introduction | What is Clean Code? |\n| 02 | Clean Code Mindset | The philosophy behind clean code |\n| 03 | Naming Things | Choose names that reveal intent |\n| 04 | Functions | Small, focused, intention-revealing |`,
  'ch01-introduction.md': `# Chapter 01 — Introduction\n\n## The standard of clean code\n\nClean code makes the next reader's work easier. Start each change by making intent visible, then reduce the number of ideas held in a single place.\n\n## Practice\n\nBefore shipping, ask: “Could someone new to this work explain this file without me?”`,
  'ch02-clean-code-mindset.md': `# Chapter 02 — Clean Code Mindset\n\n## Principle\n\nPrefer clarity over cleverness. A simple solution that reads naturally is more valuable than a compact one that requires interpretation.\n\n## Decision rule\n\nWhen choosing between two solutions, select the one with fewer hidden assumptions.`,
  'ch03-naming-things.md': `# Chapter 03 — Naming Things\n\n## Rule\n\nNames should tell readers why something exists, what it does, and how it is used. Avoid abbreviations unless they are universally understood by the people using the skill.`,
  'ch04-functions.md': `# Chapter 04 — Functions\n\n## Rule\n\nA function should do one thing. If it needs a conjunction to describe its purpose, it is likely doing too much.`,
  'ch05-comments.md': `# Chapter 05 — Comments\n\n## Rule\n\nUse comments to explain decisions, trade-offs, or constraints. Remove comments that only repeat the code around them.`,
  'glossary.md': `# Glossary\n\n## Clean code\nCode designed for clarity, maintainability, and safe change.\n\n## Intent\nThe reason a piece of code exists and the outcome it should produce.`,
  'patterns.md': `# Patterns\n\n## Extract function\nSeparate a coherent idea into a focused function when it improves readability.\n\n## Reveal intent\nReplace vague names and nested conditions with names that describe the decision being made.`,
  'cheatsheet.md': `# Clean Code Cheatsheet\n\n| When you see | Prefer |\n| --- | --- |\n| A vague name | A name that reveals intent |\n| A long function | Small focused steps |\n| A comment explaining code | Better names or structure |`,
};

function markdownParts(content) {
  return content.split('\n').map((line, index) => {
    if (line.startsWith('# ')) return <h3 key={index}>{line.slice(2)}</h3>;
    if (line.startsWith('## ')) return <h4 key={index}>{line.slice(3)}</h4>;
    if (line.startsWith('- ')) return <li key={index}>{line.slice(2)}</li>;
    if (line.startsWith('|')) return <p className="code-line" key={index}>{line}</p>;
    if (!line) return <br key={index}/>;
    return <p key={index}>{line}</p>;
  });
}

function App() {
  const [mode, setMode] = useState('text');
  const [host, setHost] = useState('Claude');
  const [activeFile, setActiveFile] = useState('SKILL.md');
  const [projectName, setProjectName] = useState('clean-code-handbook');
  const [selectedSource, setSelectedSource] = useState(null);
  const [step, setStep] = useState(-1);
  const [logs, setLogs] = useState(initialLogs);
  const [terminalOpen, setTerminalOpen] = useState(true);
  const [mobileNav, setMobileNav] = useState(false);
  const [toast, setToast] = useState('');
  const [hostOpen, setHostOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('Studio');
  const inputRef = useRef(null);
  const toastTimer = useRef(null);
  const showToast = (message) => { window.clearTimeout(toastTimer.current); setToast(message); toastTimer.current = window.setTimeout(() => setToast(''), 2600); };
  const isComplete = step === steps.length;
  const isProcessing = step >= 0 && !isComplete;

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);
  useEffect(() => {
    if (!isProcessing) return;
    const messages = [
      'Parsing source structure and checking supported content…',
      `Extracting readable text in ${mode === 'tech' ? 'framework and technical' : 'text-heavy'} mode…`,
      'Mapping chapters, concepts, and repeated decision rules…',
      'Distilling practical frameworks and on-demand chapter guides…',
      `Assembling ${projectName || 'untitled-skill'} into a portable skill folder…`,
    ];
    const timer = window.setTimeout(() => {
      setLogs(current => [...current, messages[step]]);
      setStep(current => current + 1);
    }, 850);
    return () => window.clearTimeout(timer);
  }, [step, isProcessing, mode, projectName]);

  const pickFiles = () => inputRef.current?.click();
  const handleFiles = (fileList) => {
    const file = Array.from(fileList || [])[0];
    if (!file) return;
    const cleanName = file.name.replace(/\.[^/.]+$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'untitled-skill';
    setSelectedSource(file);
    setProjectName(cleanName);
    setActiveFile('SKILL.md');
    setLogs([`Added ${file.name} (${Math.max(1, Math.round(file.size / 1024 / 1024))} MB) to this private browser session.`, 'Preparing conversion pipeline…']);
    setStep(0);
    showToast(`${file.name} is ready to convert`);
  };
  const handleDrop = (event) => { event.preventDefault(); handleFiles(event.dataTransfer.files); };
  const copyInstall = async () => {
    const command = `${hostChoices[host].replace('~', '$HOME')}/${projectName || 'your-skill'}`;
    try { await navigator.clipboard.writeText(`mkdir -p ${command} && unzip ${projectName || 'your-skill'}.zip -d ${command}`); showToast('Install command copied'); }
    catch { showToast('Copy is unavailable in this browser'); }
  };
  const downloadSkill = async () => {
    if (!isComplete) { showToast('Finish processing before downloading'); return; }
    const zip = new JSZip();
    Object.entries(fileBodies).forEach(([name, content]) => zip.file(name === 'SKILL.md' ? name : `references/${name}`, content.replace('Clean Code Handbook', projectName || 'Untitled Skill')));
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = `${projectName || 'book-to-skill'}.zip`; link.click();
    URL.revokeObjectURL(url); showToast('Private skill package downloaded');
  };
  const chooseNav = (label) => { setActiveNav(label); setMobileNav(false); showToast(label === 'Studio' ? 'You are already in Studio' : `${label} is planned for a future workspace update`); };
  const rawTokens = selectedSource ? Math.max(25600, Math.round(selectedSource.size / 4)) : 1248531;
  const finalTokens = Math.max(1200, Math.round(rawTokens / 25.9));

  return <div className="app-shell">
    <input ref={inputRef} className="hidden-input" type="file" multiple accept=".pdf,.epub,.docx,.md,.markdown,.html,.htm,.rtf,.txt" onChange={(event) => handleFiles(event.target.files)} />
    <aside className={mobileNav ? 'sidebar open' : 'sidebar'}>
      <div className="brand"><div className="brand-mark"><WandSparkles size={19}/></div><div><b>book-to-skill</b><span>Studio</span></div><button className="close-nav" onClick={() => setMobileNav(false)} aria-label="Close menu"><X size={18}/></button></div>
      <nav>{[['Studio',Home],['Projects',Folder],['Templates',Boxes],['Skills Hub',BookOpen],['Settings',Settings]].map(([label, Icon]) => <button className={activeNav === label ? 'active' : ''} onClick={() => chooseNav(label)} key={label}><Icon size={16}/>{label}</button>)}</nav>
      <div className="booklin"><div className="wizard">🧙</div><b>Booklin</b><small>Your helpful skill wizard</small></div>
      <div className="side-bottom"><button className="open-source" onClick={() => showToast('The open-source project is ready to explore')}><GitBranch size={16}/><b>book-to-skill</b><small>Open source</small><div><span>★ 18.7k</span><span>◒ 12.4k</span></div></button><button className="profile" onClick={() => showToast('Account controls are coming soon')}><div className="avatar">D</div><div><b>devcraft</b><small>Pro Plan</small></div><ChevronDown size={15}/></button></div>
    </aside>
    <main>
      <header className="topbar"><button className="hamburger" onClick={() => setMobileNav(true)} aria-label="Open menu"><Menu size={20}/></button><div></div><div className="efficiency"><b>24×–51×</b><span>Token Efficiency</span></div><button className="icon-btn" onClick={() => showToast('Your skill library is ready after conversion')} aria-label="Open skill library"><BookOpen size={19}/></button><button className="icon-btn" onClick={() => showToast('Tip: Choose technical mode when your source includes tables or code')} aria-label="Show tip"><Sparkles size={19}/></button></header>
      <section className="hero"><div><p className="eyebrow">PRIVATE SKILL WORKSPACE</p><h1>Turn any book or docs folder<br/>into an <em>AI skill in seconds</em></h1><p>book-to-skill distills books, docs, and papers into structured,<br/>agent-ready skills that are <strong>24×–51×</strong> more token efficient.</p></div><div className="hero-art"><div className="spark one"></div><div className="spark two"></div><div className="doc-chip pdf">PDF</div><div className="doc-chip md">MD</div><div className="doc-chip folder-chip"><Folder size={25}/></div><div className="open-book">⌁</div></div></section>
      <section className="panel ingest"><h2><span>1.</span> Ingest Your Source</h2><button className="dropzone" onClick={pickFiles} onDragOver={(event) => event.preventDefault()} onDrop={handleDrop}><CloudUpload size={37}/><b>{selectedSource ? selectedSource.name : 'Drag & drop a book, document, or folder here'}</b><span>{selectedSource ? 'Ready for private conversion' : 'or click to browse'}</span><div className="format-list">{['PDF','EPUB','DOCX','MD','HTML','RTF','Folder'].map(x => <i key={x}>{x}</i>)}</div></button><div className="config-grid"><label>Skill Name <input className="input skill-input" value={projectName} onChange={(event) => setProjectName(event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} /><small>Auto-slug: {projectName || 'untitled-skill'}</small></label><div className="config-item">Extraction Mode <CircleHelp size={13}/><div className="toggle"><button className={mode==='text'?'chosen':''} onClick={() => setMode('text')}><b>Text-heavy (Fast)</b><small>pdftotext / pypdf</small></button><button className={mode==='tech'?'chosen':''} onClick={() => setMode('tech')}><b>Technical (Best)</b><small>Docling (tables, code)</small></button></div></div><label className="host-wrap">Target Host <button className="input host" onClick={() => setHostOpen(value => !value)}><span className="host-icon">✦</span><div><b>{host} {host === 'Claude' ? 'Code' : ''}</b><small>{hostChoices[host]}</small></div><ChevronDown size={16}/></button>{hostOpen && <div className="host-menu">{Object.keys(hostChoices).map(name => <button key={name} onClick={() => {setHost(name); setHostOpen(false);}}>{name} <small>{hostChoices[name]}</small></button>)}</div>}<small>Supports Claude, Copilot, Amp & more</small></label></div></section>
      <section className="panel processing"><h2><span>2.</span> Processing Your Source</h2><div className="steps">{steps.map((label, index) => <div className={'step ' + (index < step ? 'done ' : '') + (index === step && isProcessing ? 'current' : '')} key={label}><div>{index < step ? '✓' : index + 1}</div><b>{label}</b></div>)}</div>{terminalOpen ? <div className="terminal"><div className="terminal-title"><span>Live Terminal Output <i className={isProcessing ? 'pulse' : ''}></i>{isProcessing ? ' Streaming' : isComplete ? ' Complete' : ' Waiting'}</span><button onClick={() => setTerminalOpen(false)}>Collapse <ChevronDown size={13}/></button></div><pre>{logs.map((log,index) => `${String(index + 1).padStart(2,'0')}: ${log}`).join('\n')}</pre></div> : <button className="reopen" onClick={() => setTerminalOpen(true)}><Terminal size={15}/> Show live terminal output</button>}</section>
      <section className="studio"><div className="panel inspector"><h2><span>3.</span> Skill Inspector & Preview Studio</h2><div className="preview-grid"><aside className="file-tree"><div className="tree-head"><b>Skill Files</b><small>9 files</small></div><button className={'tree-main '+(activeFile==='SKILL.md'?'selected':'')} onClick={() => setActiveFile('SKILL.md')}><FileText size={16}/> SKILL.md <MoreVertical size={15}/></button><div className="folder-line"><ChevronDown size={14}/><FolderOpen size={15}/> chapters/ <small>18</small></div>{chapterFiles.map(file => <button key={file} className={activeFile===file?'selected':''} onClick={() => setActiveFile(file)}><FileCode size={14}/>{file}</button>)}{['glossary.md','patterns.md','cheatsheet.md'].map(file => <button key={file} className={activeFile===file?'selected':''} onClick={() => setActiveFile(file)}><FileText size={15}/>{file}</button>)}</aside><article className="markdown"><div className="tabs"><button><FileText size={13}/>{activeFile}<X size={12}/></button><button className="plus" onClick={() => showToast('Choose another file from the skill tree')}><Plus size={17}/></button></div><div className="doc">{markdownParts((fileBodies[activeFile] || fileBodies['SKILL.md']).replace('Clean Code Handbook', projectName || 'Untitled Skill'))}</div></article></div></div><aside className="right-rail"><div className="panel stats"><h2>Token & Stats</h2><div className="donut"><div><b>~{Math.round(finalTokens / 100) / 10}k</b><span>tokens</span></div></div><dl><div><dt>Raw (Estimated)</dt><dd>{rawTokens.toLocaleString()}</dd></div><div><dt>Final (Estimated)</dt><dd>~{finalTokens.toLocaleString()}</dd></div><div><dt>Compression</dt><dd className="green">25.9×</dd></div><div><dt>Chapters</dt><dd>18</dd></div><div><dt>Files</dt><dd>9</dd></div></dl><p>Patterns <b>27</b></p><strong>{isComplete ? 'Skill ready to export' : isProcessing ? 'Building your skill…' : 'Choose a source to begin'}</strong></div><div className="panel export"><h2><span>4.</span> Export & Install</h2><button className="primary" onClick={downloadSkill} disabled={!isComplete}><Download size={16}/>Download ZIP<small>{isComplete ? 'Get your private skill package' : 'Available when processing completes'}</small></button><button onClick={copyInstall} disabled={!isComplete}><Copy size={16}/>Copy Install Command</button><button disabled><CloudUpload size={16}/>Save to Cloud (Soon)<small>Coming soon</small></button></div></aside></section>
      <footer><div>Project: <b>{projectName || 'untitled-skill'}</b><span className={isComplete ? 'complete' : 'in-progress'}>● {isComplete ? 'Completed' : isProcessing ? 'Processing' : 'Waiting'}</span></div><div>Total Tokens <b>~{finalTokens.toLocaleString()}</b></div><div>Compression <b className="green">25.9×</b></div><div>Chapters <b>18</b></div><div>Files <b>9</b></div><div className="time">◷ <span>Privacy<br/><b>Local session only</b></span></div></footer>
    </main>{toast && <div className="toast">{toast}</div>}</div>;
}
createRoot(document.getElementById('root')).render(<App/>);
