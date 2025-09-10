import DiffMatchPatch from 'diff-match-patch';

export function processDocumentDiff(oldText, newText) {
  const dmp = new DiffMatchPatch();
  
  // Clean and normalize text
  const cleanOldText = normalizeText(oldText);
  const cleanNewText = normalizeText(newText);
  
  // Generate diffs
  const diffs = dmp.diff_main(cleanOldText, cleanNewText);
  dmp.diff_cleanupSemantic(diffs);
  
  // Process changes for AI analysis
  const changes = extractChanges(diffs, cleanOldText, cleanNewText);
  
  // Format diff for display
  const formattedDiff = formatDiffForDisplay(diffs);
  
  return {
    formattedDiff,
    changes,
    rawDiffs: diffs
  };
}

function normalizeText(text) {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, '\n')
    .trim();
}

function findSentenceBoundaries(text, position, changeText) {
  // Find the start of the sentence (previous period or start of text)
  let start = position;
  while (start > 0 && text[start - 1] !== '.') {
    start--;
  }
  
  // Find the end of the sentence (next period or end of text)
  let end = position + changeText.length;
  while (end < text.length && text[end] !== '.') {
    end++;
  }
  if (end < text.length && text[end] === '.') {
    end++; // Include the period
  }
  
  return { sentence: text.slice(start, end).trim(), start, end };
}

function findCorrespondingNewSentence(oldSentence, oldText, newText, oldStart) {
  // Find the corresponding position in the new text
  const dmp = new DiffMatchPatch();
  const diffs = dmp.diff_main(oldText, newText);
  let oldPos = 0;
  let newPos = 0;
  
  for (const [operation, text] of diffs) {
    if (oldPos <= oldStart && oldPos + text.length > oldStart) {
      // Found the position in old text, map to new text
      if (operation === 0) { // Unchanged
        newPos += oldStart - oldPos;
      } else if (operation === -1) { // Deletion
        // Adjust newPos to account for deleted text
        newPos += 0;
      } else if (operation === 1) { // Addition
        newPos += text.length;
      }
      break;
    }
    if (operation === 0) { // Unchanged
      oldPos += text.length;
      newPos += text.length;
    } else if (operation === -1) { // Deletion
      oldPos += text.length;
    } else if (operation === 1) { // Addition
      newPos += text.length;
    }
  }
  
  // Find sentence boundaries in new text at the mapped position
  return findSentenceBoundaries(newText, newPos, '');
}

function groupChangesBySentence(diffs, oldText, newText) {
  const sentenceChanges = new Map();
  let oldTextPosition = 0;
  let newTextPosition = 0;
  
  for (let i = 0; i < diffs.length; i++) {
    const [operation, text] = diffs[i];
    
    if (operation === 0) { // Unchanged
      oldTextPosition += text.length;
      newTextPosition += text.length;
      continue;
    }
    
    // Find sentence boundaries
    const oldSentenceInfo = operation === -1 ? findSentenceBoundaries(oldText, oldTextPosition, text) : null;
    const newSentenceInfo = operation === 1 ? findSentenceBoundaries(newText, newTextPosition, text) : null;
    
    // Use oldSentence as the key for deletions/modifications, newSentence for additions
    const sentenceKey = oldSentenceInfo ? oldSentenceInfo.sentence : newSentenceInfo?.sentence || '';
    
    if (!sentenceChanges.has(sentenceKey)) {
      const newSentence = oldSentenceInfo
        ? findCorrespondingNewSentence(oldSentenceInfo.sentence, oldText, newText, oldSentenceInfo.start)
        : newSentenceInfo || { sentence: '' };
      
      sentenceChanges.set(sentenceKey, {
        originalSentence: oldSentenceInfo?.sentence || '',
        modifiedSentence: newSentence.sentence || '',
        originalHighlights: [],
        modifiedHighlights: [],
        types: new Set(),
        context: getContext(diffs, i),
        impact: 'low'
      });
    }
    
    const sentenceData = sentenceChanges.get(sentenceKey);
    
    if (operation === -1) { // Deletion
      sentenceData.types.add('deletion');
      sentenceData.originalHighlights.push({ text: text.trim(), type: 'deletion' });
      if (i + 1 < diffs.length && diffs[i + 1][0] === 1) {
        // Modification: deletion followed by addition
        const newText = diffs[i + 1][1];
        sentenceData.types.add('modification');
        sentenceData.modifiedHighlights.push({ text: newText.trim(), type: 'modification' });
        sentenceData.originalHighlights[sentenceData.originalHighlights.length - 1].type = 'modification';
        newTextPosition += newText.length;
        i++; // Skip the next diff (addition)
      }
      oldTextPosition += text.length;
    } else if (operation === 1) { // Addition
      if (i === 0 || diffs[i - 1][0] !== -1) {
        sentenceData.types.add('addition');
        sentenceData.modifiedHighlights.push({ text: text.trim(), type: 'addition' });
      }
      newTextPosition += text.length;
    }
    
    // Update impact based on all changes in the sentence
    sentenceData.impact = determineImpact([...sentenceData.types], text);
  }
  
  // Convert sentenceChanges to Change objects
  return Array.from(sentenceChanges.values()).map(data => ({
    type: data.types.has('modification') ? 'modification' : 
          data.types.has('addition') ? 'addition' : 'deletion',
    text: data.originalHighlights.concat(data.modifiedHighlights).map(h => h.text).join('; '),
    context: data.context,
    impact: data.impact,
    originalSentence: data.originalSentence,
    modifiedSentence: data.modifiedSentence,
    originalHighlights: data.originalHighlights,
    modifiedHighlights: data.modifiedHighlights
  })).filter(change => change.text.length > 0);
}

function extractChanges(diffs, oldText, newText) {
  return groupChangesBySentence(diffs, oldText, newText);
}

function getContext(diffs, index) {
  const contextRange = 2;
  let context = '';
  
  for (let i = Math.max(0, index - contextRange); i <= Math.min(diffs.length - 1, index + contextRange); i++) {
    if (diffs[i][0] === 0) { // Unchanged text
      context += diffs[i][1];
    }
  }
  
  return context.slice(0, 200) + (context.length > 200 ? '...' : '');
}

function determineImpact(types, text) {
  const highImpactKeywords = ['fee', 'penalty', 'terminate', 'cancel', 'liability', 'obligation'];
  const mediumImpactKeywords = ['date', 'time', 'period', 'notice', 'requirement'];
  
  const lowerText = text.toLowerCase();
  
  if (highImpactKeywords.some(keyword => lowerText.includes(keyword))) {
    return 'high';
  } else if (mediumImpactKeywords.some(keyword => lowerText.includes(keyword))) {
    return 'medium';
  }
  
  return 'low';
}

function formatDiffForDisplay(diffs) {
  return diffs.map(([operation, text]) => ({
    type: operation === 1 ? 'addition' : operation === -1 ? 'deletion' : 'unchanged',
    text
  }));
}