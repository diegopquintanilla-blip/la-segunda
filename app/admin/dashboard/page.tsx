'use client';

import { Header } from '@/components/header';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockUsers, mockDocumentVerifications, mockProducts } from '@/lib/mock-data';
import { CheckCircle, XCircle, AlertCircle, Users, FileCheck, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [pendingDocs, setPendingDocs] = useState(mockDocumentVerifications);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'users' | 'documents'>('overview');

  if (!isAuthenticated) {
    router.push('/auth/login');
    return null;
  }

  // Simple admin check (in real app, check role/permissions)
  if (user?.id !== '1') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Acceso restringido</h1>
          <p className="text-muted-foreground mb-6">
            Solo administradores pueden acceder a esta sección.
          </p>
          <Button onClick={() => router.push('/')}>Volver al inicio</Button>
        </div>
      </div>
    );
  }

  const handleApproveDocument = (docId: string) => {
    setPendingDocs(
      pendingDocs.map((doc) =>
        doc.id === docId
          ? { ...doc, status: 'approved', reviewedAt: new Date().toISOString(), reviewedBy: user?.id }
          : doc
      )
    );
  };

  const handleRejectDocument = (docId: string) => {
    setPendingDocs(
      pendingDocs.map((doc) =>
        doc.id === docId
          ? {
              ...doc,
              status: 'rejected',
              rejectionReason: 'Documento no legible',
              reviewedAt: new Date().toISOString(),
              reviewedBy: user?.id,
            }
          : doc
      )
    );
  };

  const stats = {
    totalUsers: mockUsers.length,
    totalSellers: mockUsers.filter((u) => u.isSeller).length,
    verifiedUsers: mockUsers.filter((u) => u.verificationStatus === 'verified').length,
    pendingDocuments: pendingDocs.filter((d) => d.status === 'pending').length,
    totalProducts: mockProducts.length,
    activeProducts: mockProducts.filter((p) => p.status === 'active').length,
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Panel de administración</h1>
        <p className="text-muted-foreground mb-8">Gestiona La Segunda</p>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Usuarios totales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Vendedores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSellers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Verificados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.verifiedUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Docs pendientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {stats.pendingDocuments}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Productos totales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Activos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeProducts}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          <button
            onClick={() => setSelectedTab('overview')}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              selectedTab === 'overview'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground'
            }`}
          >
            Resumen
          </button>
          <button
            onClick={() => setSelectedTab('users')}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              selectedTab === 'users'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground'
            }`}
          >
            Usuarios
          </button>
          <button
            onClick={() => setSelectedTab('documents')}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              selectedTab === 'documents'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground'
            }`}
          >
            Documentos
            {stats.pendingDocuments > 0 && (
              <Badge variant="destructive" className="ml-2">
                {stats.pendingDocuments}
              </Badge>
            )}
          </button>
        </div>

        {/* Overview Tab */}
        {selectedTab === 'overview' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Actividad reciente</CardTitle>
                <CardDescription>Últimas actividades en la plataforma</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      type: 'product',
                      message: 'María García publicó un nuevo producto',
                      time: 'Hace 2 horas',
                    },
                    {
                      type: 'user',
                      message: 'Nuevo usuario registrado: Laura Mendez',
                      time: 'Hace 4 horas',
                    },
                    {
                      type: 'sale',
                      message: 'Orden completada: S/ 2,800',
                      time: 'Hace 6 horas',
                    },
                    {
                      type: 'document',
                      message: 'Nuevo documento pendiente de verificación',
                      time: 'Hace 1 día',
                    },
                  ].map((activity, i) => (
                    <div key={i} className="flex items-start gap-4 pb-4 border-b last:border-0">
                      <div className="text-2xl">
                        {activity.type === 'product'
                          ? '📦'
                          : activity.type === 'user'
                            ? '👤'
                            : activity.type === 'sale'
                              ? '💰'
                              : '📄'}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.message}</p>
                        <p className="text-sm text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Users Tab */}
        {selectedTab === 'users' && (
          <Card>
            <CardHeader>
              <CardTitle>Gestionar usuarios</CardTitle>
              <CardDescription>Administra cuentas de usuario</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left p-2">Usuario</th>
                      <th className="text-left p-2">Email</th>
                      <th className="text-left p-2">Tipo</th>
                      <th className="text-left p-2">Estado</th>
                      <th className="text-left p-2">Calificación</th>
                      <th className="text-left p-2">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockUsers.map((u) => (
                      <tr key={u.id} className="border-b hover:bg-muted/50">
                        <td className="p-2 font-medium">{u.name}</td>
                        <td className="p-2 text-muted-foreground">{u.email}</td>
                        <td className="p-2">
                          {u.isSeller ? (
                            <Badge>Vendedor</Badge>
                          ) : (
                            <Badge variant="outline">Comprador</Badge>
                          )}
                        </td>
                        <td className="p-2">
                          {u.verificationStatus === 'verified' ? (
                            <Badge variant="default">Verificado</Badge>
                          ) : u.verificationStatus === 'pending' ? (
                            <Badge variant="secondary">Pendiente</Badge>
                          ) : (
                            <Badge variant="destructive">Rechazado</Badge>
                          )}
                        </td>
                        <td className="p-2">{u.rating}</td>
                        <td className="p-2">
                          <Button variant="outline" size="sm">
                            Revisar
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Documents Tab */}
        {selectedTab === 'documents' && (
          <Card>
            <CardHeader>
              <CardTitle>Verificación de documentos</CardTitle>
              <CardDescription>Revisa y aprueba documentos de usuarios</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold">{doc.userName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {doc.documentType === 'dni'
                        ? 'DNI'
                        : doc.documentType === 'ruc'
                          ? 'RUC'
                          : 'Pasaporte'}{' '}
                      • Cargado: {doc.uploadedAt}
                    </p>
                    {doc.status === 'approved' && (
                      <div className="flex items-center gap-2 text-sm text-green-600 mt-2">
                        <CheckCircle className="w-4 h-4" />
                        Aprobado
                      </div>
                    )}
                    {doc.status === 'rejected' && (
                      <div className="flex items-center gap-2 text-sm text-red-600 mt-2">
                        <XCircle className="w-4 h-4" />
                        Rechazado: {doc.rejectionReason}
                      </div>
                    )}
                  </div>

                  {doc.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApproveDocument(doc.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Aprobar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRejectDocument(doc.id)}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Rechazar
                      </Button>
                    </div>
                  )}

                  {doc.status !== 'pending' && (
                    <Badge
                      variant={doc.status === 'approved' ? 'default' : 'destructive'}
                    >
                      {doc.status === 'approved' ? 'Aprobado' : 'Rechazado'}
                    </Badge>
                  )}
                </div>
              ))}

              {pendingDocs.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No hay documentos pendientes
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
