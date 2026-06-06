const OFFICE_IMAGES: Record<string, string> = {
  // Supreme Court of Nepal — Ramshahpath, Kathmandu
  'supreme court of nepal':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Supreme_Court_of_Nepal_01.jpg/400px-Supreme_Court_of_Nepal_01.jpg',
  'supreme court':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Supreme_Court_of_Nepal_01.jpg/400px-Supreme_Court_of_Nepal_01.jpg',

  // Singha Durbar — main government secretariat (used for general government ministries)
  'singha durbar':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Kathmandu-35.JPG/400px-Kathmandu-35.JPG',
  'office of the prime minister':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Kathmandu-35.JPG/400px-Kathmandu-35.JPG',
  'prime ministers office':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Kathmandu-35.JPG/400px-Kathmandu-35.JPG',
}

function normalize(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim()
}

export function lookupOfficeImage(name: string): string | null {
  const key = normalize(name)
  if (OFFICE_IMAGES[key]) return OFFICE_IMAGES[key]
  // Partial match: check if any known key is contained in the name
  for (const [known, url] of Object.entries(OFFICE_IMAGES)) {
    if (key.includes(known) || known.includes(key)) return url
  }
  return null
}
