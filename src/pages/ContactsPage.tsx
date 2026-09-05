import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getMyContacts, checkUser, getBusinessProfile } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { DeviceSelector } from '@/components/layout/DeviceSelector';
import {
  Contact,
  RefreshCw,
  Search,
  Building2,
  Phone,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Mail,
} from 'lucide-react';

interface ContactItem {
  jid: string;
  name?: string;
  phone?: string;
}

interface BusinessProfile {
  address?: string;
  email?: string;
  categories?: string[];
  business_hours?: any;
  description?: string;
  website?: string[];
}

export default function ContactsPage() {
  const { deviceId } = useAuth();
  const [checkPhone, setCheckPhone] = useState('');
  const [checkResult, setCheckResult] = useState<{ registered: boolean; jid?: string } | null>(null);
  const [businessPhone, setBusinessPhone] = useState('');
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isLoadingBusiness, setIsLoadingBusiness] = useState(false);

  const { data: contactsData, isLoading, refetch } = useQuery({
    queryKey: ['contacts', deviceId],
    queryFn: () => getMyContacts().then((res) => res.data),
    enabled: !!deviceId,
  });

  const getContactsList = (): ContactItem[] => {
    if (!contactsData) return [];
    
    // Check priority: contactsData.results, contactsData.data.results, contactsData.data, contactsData
    if (Array.isArray(contactsData.results)) return contactsData.results;
    if (Array.isArray(contactsData.data?.results)) return contactsData.data.results;
    if (Array.isArray(contactsData.data)) return contactsData.data;
    if (Array.isArray(contactsData)) return contactsData;
    
    return [];
  };

  const contacts = getContactsList();

  const handleCheckNumber = async () => {
    if (!checkPhone) {
      toast.error('Masukkan nomor telepon');
      return;
    }

    setIsChecking(true);
    try {
      const response = await checkUser(checkPhone);
      setCheckResult(response.data?.data);
      if (response.data?.data?.registered) {
        toast.success('Nomor terdaftar di WhatsApp!');
      } else {
        toast.info('Nomor tidak terdaftar di WhatsApp');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal memeriksa nomor');
    } finally {
      setIsChecking(false);
    }
  };

  const handleCheckBusinessProfile = async () => {
    if (!businessPhone) {
      toast.error('Masukkan nomor telepon');
      return;
    }

    setIsLoadingBusiness(true);
    try {
      const response = await getBusinessProfile(businessPhone);
      setBusinessProfile(response.data?.data);
      if (response.data?.data) {
        toast.success('Profil bisnis ditemukan!');
      } else {
        toast.info('Profil bisnis tidak ditemukan');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal memuat profil bisnis');
      setBusinessProfile(null);
    } finally {
      setIsLoadingBusiness(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Kontak & Profil</h1>
        <p className="text-muted-foreground">Kelola kontak WhatsApp dan periksa profil bisnis.</p>
      </div>

      <DeviceSelector />

      {!deviceId ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Contact className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-muted-foreground font-medium text-center">
              Silakan pilih perangkat di atas terlebih dahulu untuk melihat kontak.
            </p>
          </CardContent>
        </Card>
      ) : (

      <Tabs defaultValue="contacts">
        <TabsList>
          <TabsTrigger value="contacts">
            <Contact className="mr-2 h-4 w-4" />
            Buku Kontak
          </TabsTrigger>
          <TabsTrigger value="check">
            <Search className="mr-2 h-4 w-4" />
            Cek Nomor
          </TabsTrigger>
          <TabsTrigger value="business">
            <Building2 className="mr-2 h-4 w-4" />
            Profil Bisnis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="contacts">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Contact className="h-5 w-5 text-primary" />
                    Buku Kontak
                  </CardTitle>
                  <CardDescription>
                    {contacts.length} kontak tersimpan
                  </CardDescription>
                </div>
                <Button variant="outline" onClick={() => refetch()}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex h-32 items-center justify-center">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : contacts.length === 0 ? (
                <div className="flex h-32 flex-col items-center justify-center text-center">
                  <Contact className="mb-2 h-10 w-10 text-muted-foreground" />
                  <p className="text-muted-foreground">Tidak ada kontak</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>Nomor / JID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.isArray(contacts) && contacts.length > 0 ? (
                      contacts.map((contact) => (
                        <TableRow key={contact.jid}>
                          <TableCell className="font-medium">
                            {contact.name || 'Tanpa Nama'}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {contact.phone || contact.jid}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2} className="h-24 text-center text-muted-foreground">
                          {isLoading ? 'Memuat data...' : 'Tidak ada kontak ditemukan atau format data salah.'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="check">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary" />
                Cek Nomor WhatsApp
              </CardTitle>
              <CardDescription>
                Periksa apakah nomor terdaftar di WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="628xxxxxxxxxx"
                    value={checkPhone}
                    onChange={(e) => setCheckPhone(e.target.value)}
                  />
                </div>
                <Button onClick={handleCheckNumber} disabled={isChecking}>
                  {isChecking ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="mr-2 h-4 w-4" />
                  )}
                  Cek
                </Button>
              </div>

              {checkResult && (
                <Card className={checkResult.registered ? 'border-primary/50 bg-primary/5' : 'border-muted'}>
                  <CardContent className="flex items-center gap-4 py-4">
                    {checkResult.registered ? (
                      <>
                        <CheckCircle className="h-10 w-10 text-primary" />
                        <div>
                          <p className="font-semibold text-primary">Terdaftar</p>
                          <p className="text-sm text-muted-foreground">
                            JID: {checkResult.jid}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-10 w-10 text-muted-foreground" />
                        <div>
                          <p className="font-semibold">Tidak Terdaftar</p>
                          <p className="text-sm text-muted-foreground">
                            Nomor ini tidak terdaftar di WhatsApp
                          </p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Profil Bisnis
              </CardTitle>
              <CardDescription>
                Lihat profil WhatsApp Business
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="628xxxxxxxxxx"
                    value={businessPhone}
                    onChange={(e) => setBusinessPhone(e.target.value)}
                  />
                </div>
                <Button onClick={handleCheckBusinessProfile} disabled={isLoadingBusiness}>
                  {isLoadingBusiness ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="mr-2 h-4 w-4" />
                  )}
                  Lihat Profil
                </Button>
              </div>

              {businessProfile && (
                <Card>
                  <CardContent className="space-y-4 py-4">
                    {businessProfile.description && (
                      <div>
                        <Label className="text-muted-foreground">Deskripsi</Label>
                        <p>{businessProfile.description}</p>
                      </div>
                    )}
                    {businessProfile.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="mt-1 h-4 w-4 text-muted-foreground" />
                        <div>
                          <Label className="text-muted-foreground">Alamat</Label>
                          <p>{businessProfile.address}</p>
                        </div>
                      </div>
                    )}
                    {businessProfile.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <Label className="text-muted-foreground">Email</Label>
                          <p>{businessProfile.email}</p>
                        </div>
                      </div>
                    )}
                    {businessProfile.categories && businessProfile.categories.length > 0 && (
                      <div>
                        <Label className="text-muted-foreground">Kategori</Label>
                        <p>{businessProfile.categories.join(', ')}</p>
                      </div>
                    )}
                    {businessProfile.website && businessProfile.website.length > 0 && (
                      <div>
                        <Label className="text-muted-foreground">Website</Label>
                        <div className="flex flex-col gap-1">
                          {businessProfile.website.map((url, i) => (
                            <a
                              key={i}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {url}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      )}
    </div>
  );
}
