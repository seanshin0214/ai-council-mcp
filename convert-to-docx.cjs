const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = require('docx');

// Markdown 파일을 간단하게 파싱해서 Word 문서로 변환
async function convertMarkdownToDocx(mdFilePath, outputPath) {
  const content = fs.readFileSync(mdFilePath, 'utf-8');
  const lines = content.split('\n');

  const children = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 빈 줄
    if (line.trim() === '') {
      children.push(new Paragraph({ text: '' }));
      continue;
    }

    // 헤딩
    if (line.startsWith('# ')) {
      children.push(
        new Paragraph({
          text: line.replace(/^#\s+/, ''),
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        })
      );
    } else if (line.startsWith('## ')) {
      children.push(
        new Paragraph({
          text: line.replace(/^##\s+/, ''),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 150 },
        })
      );
    } else if (line.startsWith('### ')) {
      children.push(
        new Paragraph({
          text: line.replace(/^###\s+/, ''),
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200, after: 100 },
        })
      );
    } else if (line.startsWith('#### ')) {
      children.push(
        new Paragraph({
          text: line.replace(/^####\s+/, ''),
          heading: HeadingLevel.HEADING_4,
          spacing: { before: 150, after: 75 },
        })
      );
    }
    // 코드 블록
    else if (line.startsWith('```')) {
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: codeLines.join('\n'),
              font: 'Consolas',
              size: 20,
            }),
          ],
          shading: {
            fill: 'F5F5F5',
          },
          spacing: { before: 100, after: 100 },
        })
      );
    }
    // 리스트
    else if (line.match(/^[-*]\s+/)) {
      children.push(
        new Paragraph({
          text: line.replace(/^[-*]\s+/, '• '),
          spacing: { before: 50, after: 50 },
        })
      );
    }
    // 번호 리스트
    else if (line.match(/^\d+\.\s+/)) {
      children.push(
        new Paragraph({
          text: line,
          spacing: { before: 50, after: 50 },
        })
      );
    }
    // 일반 텍스트
    else {
      // 볼드, 이탤릭 등 간단한 마크다운 처리
      let text = line;
      const runs = [];

      // 간단한 텍스트로 처리 (복잡한 마크다운은 무시)
      runs.push(new TextRun({ text: text }));

      children.push(
        new Paragraph({
          children: runs,
          spacing: { before: 50, after: 50 },
        })
      );
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: children,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ ${path.basename(outputPath)} 생성 완료`);
}

// 3개 문서 변환
async function main() {
  const docs = [
    { input: 'README.md', output: 'README.docx' },
    { input: 'INSTALLATION.md', output: 'INSTALLATION.docx' },
    { input: 'TECHNICAL_SPEC.md', output: 'TECHNICAL_SPEC.docx' },
  ];

  for (const doc of docs) {
    const inputPath = path.join(__dirname, doc.input);
    const outputPath = path.join(__dirname, doc.output);

    if (fs.existsSync(inputPath)) {
      await convertMarkdownToDocx(inputPath, outputPath);
    } else {
      console.log(`⚠️ ${doc.input} 파일을 찾을 수 없습니다.`);
    }
  }

  console.log('\n🎉 모든 문서 변환 완료!');
  console.log('저장 위치: C:\\Users\\sshin\\Documents\\ai-council-mcp\\');
}

main().catch(console.error);
