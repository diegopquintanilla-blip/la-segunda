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

// Mock Products
export const mockProducts: Product[] = [
  {
    id: 'p1',
    title: 'iPhone 12 Pro - Excelente estado',
    description: 'iPhone 12 Pro de 128GB color oro. Sin rayaduras ni golpes. Incluye caja y cargador original.',
    price: 2800,
    category: 'Electrónica',
    condition: 'excellent',
    images: [
      'https://images.unsplash.com/photo-1592286927505-1def25115558?w=500',
      'https://images.unsplash.com/photo-1592286927505-1def25115558?w=500',
    ],
    sellerId: '1',
    sellerName: 'María García',
    sellerRating: 4.8,
    views: 345,
    favoriteCount: 23,
    createdAt: '2024-05-01',
    status: 'active',
  },
  {
    id: 'p2',
    title: 'Laptop Dell XPS 13 - Como nueva',
    description: 'Dell XPS 13, Intel i7, 16GB RAM, 512GB SSD. Prácticamente sin uso. Perfecta para trabajo y estudio.',
    price: 3500,
    category: 'Electrónica',
    condition: 'like-new',
    images: [
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500',
    ],
    sellerId: '2',
    sellerName: 'Carlos López',
    sellerRating: 4.5,
    views: 287,
    favoriteCount: 18,
    createdAt: '2024-05-02',
    status: 'active',
  },
  {
    id: 'p3',
    title: 'Sofá de cuero gris - 3 cuerpos',
    description: 'Sofá de cuero genuino en excelente estado. Medidas: 2.80m x 0.95m. Retiro en Lima.',
    price: 1800,
    category: 'Muebles',
    condition: 'excellent',
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500',
    ],
    sellerId: '3',
    sellerName: 'Ana Rodríguez',
    sellerRating: 4.9,
    views: 512,
    favoriteCount: 42,
    createdAt: '2024-04-28',
    status: 'active',
  },
  {
    id: 'p4',
    title: 'Bicicleta de montaña Trek - Buenas condiciones',
    description: 'Bicicleta Trek de 21 velocidades. Aro 26". Poco uso. Ideal para aventureros.',
    price: 850,
    category: 'Deportes',
    condition: 'good',
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500',
    ],
    sellerId: '1',
    sellerName: 'María García',
    sellerRating: 4.8,
    views: 198,
    favoriteCount: 12,
    createdAt: '2024-05-03',
    status: 'active',
  },
  {
    id: 'p5',
    title: 'Cámara Canon EOS 5D Mark IV + Lentes',
    description: 'Cámara profesional con 2 lentes (24-70mm y 50mm). Perfecta para fotografía profesional.',
    price: 5200,
    category: 'Electrónica',
    condition: 'excellent',
    images: [
      'https://images.unsplash.com/photo-1611532736579-6b16e2b50449?w=500',
    ],
    sellerId: '2',
    sellerName: 'Carlos López',
    sellerRating: 4.5,
    views: 428,
    favoriteCount: 35,
    createdAt: '2024-04-25',
    status: 'active',
  },
  {
    id: 'p6',
    title: 'Guitarra Acústica Yamaha - Incluye estuche',
    description: 'Guitarra acústica Yamaha F310. En perfecto estado. Incluye estuche y correas.',
    price: 650,
    category: 'Música',
    condition: 'excellent',
    images: [
      'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=500',
    ],
    sellerId: '3',
    sellerName: 'Ana Rodríguez',
    sellerRating: 4.9,
    views: 167,
    favoriteCount: 8,
    createdAt: '2024-05-01',
    status: 'active',
  },
];

// Mock Reviews
export const mockReviews: Review[] = [
  {
    id: 'r1',
    productId: 'p1',
    buyerId: '4',
    buyerName: 'Pedro Torres',
    rating: 5,
    comment: 'Producto exactamente como se describía. Vendedor muy responsable.',
    createdAt: '2024-04-20',
  },
  {
    id: 'r2',
    productId: 'p1',
    buyerId: '5',
    buyerName: 'Laura Mendez',
    rating: 5,
    comment: 'Excelente estado. Recomiendo 100%',
    createdAt: '2024-04-15',
  },
  {
    id: 'r3',
    productId: 'p3',
    buyerId: '1',
    buyerName: 'María García',
    rating: 5,
    comment: 'Ana es confiable. El sofá llegó en perfectas condiciones.',
    createdAt: '2024-04-10',
  },
];

// Mock Chat Messages
export const mockChatMessages: ChatMessage[] = [
  {
    id: 'c1',
    conversationId: 'conv1',
    senderId: '1',
    senderName: 'María García',
    message: 'Hola, ¿aún disponible el iPhone?',
    timestamp: '2024-05-03 14:30',
    read: true,
  },
  {
    id: 'c2',
    conversationId: 'conv1',
    senderId: '4',
    senderName: 'Pedro Torres',
    message: 'Sí, aún disponible. ¿Cuándo podrías venir a verlo?',
    timestamp: '2024-05-03 14:45',
    read: true,
  },
  {
    id: 'c3',
    conversationId: 'conv1',
    senderId: '1',
    senderName: 'María García',
    message: 'Esta tarde alrededor de las 5 pm?',
    timestamp: '2024-05-03 15:00',
    read: false,
  },
];

// Mock Orders
export const mockOrders: Order[] = [
  {
    id: 'o1',
    productId: 'p1',
    buyerId: '4',
    sellerId: '1',
    amount: 2800,
    status: 'completed',
    createdAt: '2024-04-20',
    updatedAt: '2024-04-22',
  },
  {
    id: 'o2',
    productId: 'p3',
    buyerId: '1',
    sellerId: '3',
    amount: 1800,
    status: 'completed',
    createdAt: '2024-04-10',
    updatedAt: '2024-04-12',
  },
];

// Mock Memberships
export const mockMemberships: Membership[] = [
  {
    id: 'm1',
    type: 'standard',
    name: 'Vendedor Estándar',
    price: 0,
    commissionRate: 10,
    features: ['Listar hasta 10 productos', 'Chat con compradores', 'Reporte básico de ventas'],
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

// Mock Notifications
export const mockNotifications = [
  {
    id: 'n1',
    userId: '4',
    title: 'Tu producto se vendió',
    message: 'Tu iPhone 12 Pro fue comprado por Pedro Torres',
    type: 'sale',
    read: false,
    timestamp: '2024-05-03 14:00',
  },
  {
    id: 'n2',
    userId: '1',
    title: 'Nuevo mensaje',
    message: 'María García te envió un mensaje',
    type: 'message',
    read: true,
    timestamp: '2024-05-03 13:30',
  },
];
