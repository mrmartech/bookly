import JSZip from 'jszip';

const decodeHtml = (value) => new DOMParser().parseFromString(value, 'text/html').body.textContent || '';

function cleanText(value) {
  return value
    .replace(/\r/g, '')
    .replace(/\u00a0/g, ' ')
    .replace(/[\t ]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function extractSourceText(file) {
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (['txt', 'md', 'markdown'].includes(extension)) return cleanText(await file.text());
  if (['html', 'htm'].includes(extension)) return cleanText(decodeHtml(await file.text()));
  if (extension === 'rtf') return cleanText((await file.text()).replace(/\\par[d]?/g, '\n').replace(/\\'[0-9a-f]{2}/gi, '').replace(/\\[a-z]+-?\d* ?/gi, '').replace(/[{}]/g, ''));
  if (['docx', 'epub'].includes(extension)) {
    const archive = await JSZip.loadAsync(file);
    const names = extension === 'docx'
      ? Object.keys(archive.files).filter((name) => /^word\/document\.xml$/.test(name))
      : Object.keys(archive.files).filter((name) => /\.(xhtml|html|htm)$/i.test(name));
    const fragments = await Promise.all(names.map(async (name) => decodeHtml(await archive.files[name].async('string'))));
    return cleanText(fragments.join('\n\n'));
  }
  throw new Error('This source type is not ready for local extraction yet. Use TXT, Markdown, HTML, RTF, DOCX, or EPUB.');
}

function titleFromText(text, fallback) {
  const heading = text.match(/^#{1,2}\s+(.+)$/m)?.[1] || text.match(/^(.{4,80})\n[=-]{3,}$/m)?.[1];
  return (heading || fallback).replace(/[*_`]/g, '').trim();
}

function sentences(text) {
  return text.replace(/\n/g, ' ').split(/(?<=[.!?])\s+/).map((item) => item.trim()).filter((item) => item.length > 35);
}

function summaryBullets(text) {
  const unique = [];
  for (const sentence of sentences(text)) {
    const normalized = sentence.toLowerCase().replace(/[^a-z0-9 ]/g, '').slice(0, 80);
    if (!unique.some((item) => item.key === normalized) && sentence.length < 240) unique.push({ key: normalized, value: sentence });
    if (unique.length === 6) break;
  }
  return unique.length ? unique.map((item) => `- ${item.value}`).join('\n') : '- Review the source material and apply its key guidance with clear, focused steps.';
}

function sourceSections(text) {
  const headingSections = text.split(/(?=^#{1,2}\s+)/m).map(cleanText).filter((section) => section.length > 120);
  if (headingSections.length > 1) return headingSections.slice(0, 8);
  const words = text.split(/\s+/);
  const size = Math.max(220, Math.ceil(words.length / 5));
  return Array.from({ length: Math.min(5, Math.ceil(words.length / size)) }, (_, index) => words.slice(index * size, (index + 1) * size).join(' ')).filter(Boolean);
}

export async function createSkillFromSource(file, skillName) {
  const text = await extractSourceText(file);
  if (text.length < 80) throw new Error('The selected material does not contain enough readable text to create a skill.');
  const title = titleFromText(text, skillName.replace(/-/g, ' '));
  const sections = sourceSections(text);
  const sectionFiles = sections.map((section, index) => {
    const sectionTitle = titleFromText(section, `Source guide ${index + 1}`);
    const body = section.replace(/^#{1,2}\s+.*$/m, '').trim();
    return {
      path: `references/${String(index + 1).padStart(2, '0')}-${sectionTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'guide'}.md`,
      content: `# ${sectionTitle}\n\n## Key guidance\n\n${summaryBullets(body)}\n\n## Source notes\n\n${body.slice(0, 3400)}`,
    };
  });
  const overview = `# ${title}\n\nA source-derived skill created from **${file.name}**. Use it as an on-demand guide, and open the related reference files for the original guidance and examples.\n\n## Core guidance\n\n${summaryBullets(text)}\n\n## How to use this skill\n\n1. Identify the task or decision you need to make.\n2. Start with the core guidance above.\n3. Read the relevant source guide for more context before acting.\n\n## Source guides\n\n${sectionFiles.map((item) => `- ${item.path.replace('references/', '')}`).join('\n')}`;
  return [{ path: 'SKILL.md', content: overview }, ...sectionFiles];
}
