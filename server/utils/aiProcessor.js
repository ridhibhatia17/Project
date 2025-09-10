export async function generateAIExplanations(changes, oldText, newText) {
  // Placeholder AI explanation generator
  // In production, this would call OpenAI, Google Vertex AI, or similar
  
  const explanations = [];
  
  for (let i = 0; i < changes.length; i++) {
    const explanation = await generateExplanation(changes[i], oldText, newText, i, changes);
    explanations.push(explanation);
  }
  
  return explanations;
}

async function generateExplanation(change, oldText, newText, index, changes) {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const { type, text, context } = change;
  
  // Date detection regex (matches formats like "29 September", "September 29", "29/09/2023", etc.)
  const dateRegex = /\b(\d{1,2}(?:st|nd|rd|th)?\s*(?:January|February|March|April|May|June|July|August|September|October|November|December)|(?:January|February|March|April|May|June|July|August|September|October|November|December)\s*\d{1,2}(?:st|nd|rd|th)?|\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)\b/gi;

  // Helper function to find the corresponding change for modifications
  const findCorrespondingChange = (currentIndex, currentType) => {
    if (currentType === 'deletion') {
      // Look for the next addition
      for (let i = currentIndex + 1; i < changes.length; i++) {
        if (changes[i].type === 'addition' && changes[i].context === context) {
          return changes[i].text;
        }
      }
    } else if (currentType === 'addition') {
      // Look for the previous deletion
      for (let i = currentIndex - 1; i >= 0; i--) {
        if (changes[i].type === 'deletion' && changes[i].context === context) {
          return changes[i].text;
        }
      }
    }
    return null;
  };

  // Detect dates in the text
  const detectDates = (text) => {
    const matches = text.match(dateRegex);
    return matches ? matches : [];
  };

  // Truncate text for display
  const truncateText = (text, maxLength = 100) => {
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };

  // Generate contextual explanations based on change type and content
  if (type === 'addition') {
    const dates = detectDates(text);
    let summary = '';
    let detail = '';
    let category = 'general';

    if (dates.length > 0) {
      summary = `The date "${dates[0]}" was added.`;
      detail = `A new date "${dates[0]}" was added to the document: "${truncateText(text)}". This introduces a new temporal reference in the terms.`;
      category = 'date';
    } else if (text.toLowerCase().includes('fee') || text.toLowerCase().includes('cost')) {
      summary = `The text "${truncateText(text, 50)}" was added.`;
      detail = `A new financial term was added: "${truncateText(text)}". This introduces new financial obligations in the document.`;
      category = 'financial';
    } else if (text.toLowerCase().includes('terminate') || text.toLowerCase().includes('cancel')) {
      summary = `The text "${truncateText(text, 50)}" was added.`;
      detail = `A new termination clause was added: "${truncateText(text)}". This introduces new conditions under which agreements may be terminated.`;
      category = 'termination';
    } else if (text.toLowerCase().includes('liability') || text.toLowerCase().includes('responsible')) {
      summary = `The text "${truncateText(text, 50)}" was added.`;
      detail = `A new liability clause was added: "${truncateText(text)}". This clarifies new responsibilities in the document.`;
      category = 'liability';
    } else {
      summary = `The text "${truncateText(text, 50)}" was added.`;
      detail = `New content was added to the document: "${truncateText(text)}". This expands the document with additional terms or clarifications.`;
    }
    
    return {
      summary,
      detail,
      impact: change.impact,
      category
    };
  } else if (type === 'deletion') {
    const dates = detectDates(text);
    let summary = '';
    let detail = '';
    let category = 'general';

    if (dates.length > 0) {
      summary = `The date "${dates[0]}" was removed.`;
      detail = `The date "${dates[0]}" was removed from the document: "${truncateText(text)}". This eliminates a temporal reference from the terms.`;
      category = 'date';
    } else if (text.toLowerCase().includes('fee') || text.toLowerCase().includes('cost')) {
      summary = `The text "${truncateText(text, 50)}" was removed.`;
      detail = `A financial term was removed: "${truncateText(text)}". This may reduce costs or eliminate certain fees.`;
      category = 'financial';
    } else if (text.toLowerCase().includes('protection') || text.toLowerCase().includes('right')) {
      summary = `The text "${truncateText(text, 50)}" was removed.`;
      detail = `A right or protection was removed: "${truncateText(text)}". This may reduce available protections in the document.`;
      category = 'rights';
    } else {
      summary = `The text "${truncateText(text, 50)}" was removed.`;
      detail = `Content was removed from the document: "${truncateText(text)}". This may simplify terms or remove certain provisions.`;
    }
    
    return {
      summary,
      detail,
      impact: change.impact,
      category
    };
  } else if (type === 'modification') {
    const oldTextSegment = findCorrespondingChange(index, 'deletion') || '';
    const newTextSegment = findCorrespondingChange(index, 'addition') || text;
    const oldDates = detectDates(oldTextSegment);
    const newDates = detectDates(newTextSegment);
    
    let summary = '';
    let detail = '';
    let category = 'general';
    
    if (oldDates.length > 0 && newDates.length > 0) {
      summary = `The date "${oldDates[0]}" was removed and the date "${newDates[0]}" was added.`;
      detail = `The date in the document was modified from "${oldDates[0]}" to "${newDates[0]}" in the context: "${truncateText(context)}". This updates a temporal reference in the terms.`;
      category = 'date';
    } else {
      summary = `The text "${truncateText(oldTextSegment, 50)}" was removed and the text "${truncateText(newTextSegment, 50)}" was added.`;
      detail = `The document content was modified from "${truncateText(oldTextSegment)}" to "${truncateText(newTextSegment)}" in the context: "${truncateText(context)}". This updates the content of the terms.`;
    }
    
    return {
      summary,
      detail,
      impact: change.impact,
      category
    };
  }
  
  return {
    summary: `The text "${truncateText(text, 50)}" was modified.`,
    detail: `The document has been modified in this section: "${truncateText(text)}". Please review the changes carefully.`,
    impact: change.impact,
    category: 'general'
  };
}