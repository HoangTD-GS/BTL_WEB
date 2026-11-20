export interface ListItem {
  id: string;
  text: string;
}

export const newItem = (text = ''): ListItem => ({ id: crypto.randomUUID(), text });
