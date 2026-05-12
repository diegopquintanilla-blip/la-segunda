/**
 * Generate an avatar URL based on gender preference
 */
export function getAvatarByGender(name: string, gender?: 'male' | 'female' | 'neutral'): string {
  const seed = name.toLowerCase().replace(/\s+/g, '_');
  
  switch (gender) {
    case 'male':
      return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}_male&style=male`;
    case 'female':
      return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}_female&style=female`;
    case 'neutral':
      return `https://api.dicebear.com/7.x/personas/svg?seed=${seed}`;
    default:
      return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
  }
}

/**
 * Get gender label in Spanish
 */
export function getGenderLabel(gender?: 'male' | 'female' | 'neutral'): string {
  switch (gender) {
    case 'male':
      return 'Hombre';
    case 'female':
      return 'Mujer';
    case 'neutral':
      return 'Prefiero no decirlo';
    default:
      return 'No especificado';
  }
}

/**
 * Get account type label in Spanish
 */
export function getAccountTypeLabel(accountType?: 'buyer' | 'seller' | 'both'): string {
  switch (accountType) {
    case 'buyer':
      return 'Comprador';
    case 'seller':
      return 'Vendedor';
    case 'both':
      return 'Comprador y Vendedor';
    default:
      return 'Sin especificar';
  }
}
