
/**
 * @author [AnnieLin]
 */
import nlp from 'compromise';


export async function autoTag(text) {
  const cleanText = text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')       // remove punctuation
    .replace(/\s+/g, ' ')          // collapse extra spaces
    .trim();

  const doc = nlp(cleanText);
  let allNouns = doc.nouns().out('array');

  allNouns = allNouns
    .map(noun => noun.trim())
    .filter(noun => noun && !noun.includes(' ')) 
    .filter((val, idx, self) => self.indexOf(val) === idx); // dedupe

  const predefinedTags = {
    dessert: ["cake", "sweet", "ice cream", "pastry", "donut", "dessert"],
    cafe: ["coffee", "latte", "espresso", "brew", "cafe", "café"],
    france: ["paris", "france", "louvre"],
    uk: ["london", "england"],
    america: ["usa", "america", "new york"],
    spain: ["spain", "barcelona"],
    "new zealand": ["nz", "queenstown", "auckland"],
    travel: ["trip", "journey", "adventure"]
  };

  const tagsMap = new Map();

  // predefined tags
  for (const [tag, keywords] of Object.entries(predefinedTags)) {
    for (const keyword of keywords) {
      if (cleanText.includes(keyword)) {
        tagsMap.set(tag, 'predefined');
        break;
      }
    }
  }

  // Add top 10 suggested
  for (const noun of allNouns.slice(0, 10)) {
    if (!tagsMap.has(noun)) {
      tagsMap.set(noun, 'suggested');
    }
  }

  return Array.from(tagsMap.entries()).map(([tag, source]) => ({
    tag,
    source
  }));
}
