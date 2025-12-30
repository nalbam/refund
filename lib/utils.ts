export interface Subgroup {
  id: string;
  name: string;
  channelId: string;
  contactId?: string;
}

/**
 * Parse subgroups from environment variable
 * Format: id,name,channelId;id,name,channelId
 */
export function parseSubgroups(subgroupsEnv: string): Subgroup[] {
  if (!subgroupsEnv) {
    return [];
  }

  const subgroups: Subgroup[] = [];
  const groups = subgroupsEnv.split(';');

  for (const group of groups) {
    const parts = group.split(',');
    
    // Validate that we have exactly 3 parts
    if (parts.length !== 3) {
      console.warn(`Invalid subgroup format: ${group}. Expected format: id,name,channelId`);
      continue;
    }

    const [id, name, channelId] = parts;
    
    // Validate that all parts are non-empty after trimming
    if (!id.trim() || !name.trim() || !channelId.trim()) {
      console.warn(`Invalid subgroup format: ${group}. All fields must be non-empty`);
      continue;
    }

    subgroups.push({
      id: id.trim(),
      name: name.trim(),
      channelId: channelId.trim(),
    });
  }

  return subgroups;
}

/**
 * Sanitize text for Slack message to prevent formatting issues
 * Escapes special characters that could affect Slack message rendering
 */
export function sanitizeForSlack(text: string): string {
  if (!text) return '';
  
  // Escape special characters for Slack
  // Handle HTML entities first
  let sanitized = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  // Escape Slack markdown characters by prefixing with backslash
  // This prevents markdown formatting exploitation
  sanitized = sanitized
    .replace(/\*/g, '\\*')
    .replace(/_/g, '\\_')
    .replace(/~/g, '\\~')
    .replace(/`/g, '\\`');
  
  return sanitized;
}
