// Mock data types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  isSeller: boolean;
  sellerBadge?: 'standard' | 'premium' | 'elite';
  joinDate: string;
  bio?: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  gender?: 'male' | 'female' | 'neutral';
  city?: string;
  accountType?: 'buyer' | 'seller' | 'both';
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: 'like-new' | 'excellent' | 'good' | 'fair';
  images: string[];
  sellerId: string;
  sellerName: string;
  sellerRating: number;
  views: number;
  favoriteCount: number;
  createdAt: string;
  status: 'active' | 'sold' | 'pending';
}

export interface Review {
  id: string;
  productId: string;
  buyerId: string;
  buyerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface Order {
  id: string;
  productId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface Membership {
  id: string;
  type: 'standard' | 'premium' | 'elite';
  name: string;
  price: number;
  commissionRate: number;
  features: string[];
  monthlyListingLimit: number;
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'moderator';
}

export interface DocumentVerification {
  id: string;
  userId: string;
  userName: string;
  documentType: 'dni' | 'ruc' | 'passport';
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

// Mock Users
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'María García',
    email: 'maria@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    rating: 4.8,
    reviewCount: 127,
    isSeller: true,
    sellerBadge: 'premium',
    joinDate: '2022-03-15',
    bio: 'Vendo artículos de electrónica y accesorios de calidad',
    verificationStatus: 'verified',
  },
  {
    id: '2',
    name: 'Carlos López',
    email: 'carlos@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
    rating: 4.5,
    reviewCount: 89,
    isSeller: true,
    sellerBadge: 'standard',
    joinDate: '2022-07-22',
    bio: 'Especialista en ropa y moda de segunda mano',
    verificationStatus: 'verified',
  },
  {
    id: '3',
    name: 'Ana Rodríguez',
    email: 'ana@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana',
    rating: 4.9,
    reviewCount: 256,
    isSeller: true,
    sellerBadge: 'elite',
    joinDate: '2021-01-10',
    bio: 'Tienda de muebles y decoración de alta calidad',
    verificationStatus: 'verified',
  },
  {
    id: '4',
    name: 'Pedro Torres',
    email: 'pedro@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro',
    rating: 4.2,
    reviewCount: 34,
    isSeller: false,
    joinDate: '2023-05-08',
    verificationStatus: 'pending',
  },
  {
    id: '5',
    name: 'Laura Mendez',
    email: 'laura@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Laura',
    rating: 0,
    reviewCount: 0,
    isSeller: true,
    sellerBadge: 'standard',
    joinDate: '2024-01-12',
    verificationStatus: 'pending',
  },
];

// Productos demo eliminados
export const mockProducts: Product[] = [];

// Reseñas demo eliminadas porque dependían de productos demo
export const mockReviews: Review[] = [];

// Mensajes demo eliminados
export const mockChatMessages: ChatMessage[] = [];

// Órdenes demo eliminadas porque dependían de productos demo
export const mockOrders: Order[] = [];

// Mock Memberships
export const mockMemberships: Membership[] = [
  {
    id: 'm1',
    type: 'standard',
    name: 'Vendedor Estándar',
    price: 0,
    commissionRate: 10,
    features: [
      'Listar hasta 10 productos',
      'Chat con compradores',
      'Reporte básico de ventas',
    ],
    monthlyListingLimit: 10,
  },
  {
    id: 'm2',
    type: 'premium',
    name: 'Vendedor Premium',
    price: 29.99,
    commissionRate: 6,
    features: [
      'Listar hasta 50 productos',
      'Chat con compradores',
      'Estadísticas detalladas',
      'Descuentos en promociones',
    ],
    monthlyListingLimit: 50,
  },
  {
    id: 'm3',
    type: 'elite',
    name: 'Vendedor Elite',
    price: 79.99,
    commissionRate: 3,
    features: [
      'Listar productos ilimitados',
      'Prioridad en búsqueda',
      'Soporte dedicado',
      'Analíticas avanzadas',
      'Publicidad gratis',
    ],
    monthlyListingLimit: 9999,
  },
];

// Mock Document Verifications
export const mockDocumentVerifications: DocumentVerification[] = [
  {
    id: 'doc1',
    userId: '5',
    userName: 'Laura Mendez',
    documentType: 'dni',
    status: 'pending',
    uploadedAt: '2024-05-03',
  },
  {
    id: 'doc2',
    userId: '1',
    userName: 'María García',
    documentType: 'ruc',
    status: 'approved',
    uploadedAt: '2024-03-15',
    reviewedAt: '2024-03-16',
    reviewedBy: 'admin1',
  },
];

// Mock Admin Users
export const mockAdminUsers: AdminUser[] = [
  {
    id: 'admin1',
    email: 'admin@lasegunda.com',
    role: 'admin',
  },
  {
    id: 'admin2',
    email: 'moderator@lasegunda.com',
    role: 'moderator',
  },
];

// Notificaciones demo eliminadas
export const mockNotifications = [];
