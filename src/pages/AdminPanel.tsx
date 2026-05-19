import { useEffect, useState } from 'react';
import { collection, query, orderBy, getDocs, doc, getDoc, updateDoc, deleteDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { useAuth } from '@/src/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  ShieldCheck, 
  Users, 
  FileText, 
  Settings, 
  Search, 
  Save,
  Loader2,
  ExternalLink,
  Trash2,
  Briefcase,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminPanel() {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [jobRoles, setJobRoles] = useState<any[]>([]);
  const [config, setConfig] = useState<any>({ interviewerPrompt: '', feedbackPrompt: '' });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newRole, setNewRole] = useState({ title: '', description: '' });

  const fetchData = async () => {
    try {
      // Fetch interviews
      const interviewSnap = await getDocs(query(collection(db, 'interviews'), orderBy('createdAt', 'desc')));
      setInterviews(interviewSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // Fetch users
      const userSnap = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc')));
      setUsers(userSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // Fetch job roles
      const rolesSnap = await getDocs(query(collection(db, 'jobRoles'), orderBy('title', 'asc')));
      setJobRoles(rolesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // Fetch config
      const configDoc = await getDoc(doc(db, 'config', 'global'));
      if (configDoc.exists()) {
        setConfig(configDoc.data());
      }
    } catch (error) {
      console.error("Admin fetch error:", error);
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteInterview = async (id: string) => {
    if (!confirm("Are you sure you want to delete this interview session?")) return;
    try {
      await deleteDoc(doc(db, 'interviews', id));
      setInterviews(prev => prev.filter(i => i.id !== id));
      toast.success("Interview deleted");
    } catch (error) {
      toast.error("Failed to delete interview");
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user profile?")) return;
    try {
      await deleteDoc(doc(db, 'users', id));
      setUsers(prev => prev.filter(u => u.id !== id));
      toast.success("User profile deleted");
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  const handleAddRole = async () => {
    if (!newRole.title) return;
    try {
      const roleRef = doc(collection(db, 'jobRoles'));
      await setDoc(roleRef, {
        ...newRole,
        createdAt: serverTimestamp()
      });
      setJobRoles(prev => [...prev, { id: roleRef.id, ...newRole }]);
      setNewRole({ title: '', description: '' });
      toast.success("Job role added");
    } catch (error) {
      toast.error("Failed to add job role");
    }
  };

  const handleDeleteRole = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'jobRoles', id));
      setJobRoles(prev => prev.filter(r => r.id !== id));
      toast.success("Job role removed");
    } catch (error) {
      toast.error("Failed to delete job role");
    }
  };

  const handleSaveConfig = async () => {
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'config', 'global'), {
        ...config,
        updatedBy: user?.uid,
        updatedAt: serverTimestamp()
      });
      toast.success("System configuration updated!");
    } catch (error) {
      console.error("Config update error:", error);
      toast.error("Failed to update configuration");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
          <ShieldCheck className="text-white w-7 h-7" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Admin Control Panel</h1>
          <p className="text-neutral-500">Manage platform settings and monitor interview activity.</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-8">
        <TabsList className="bg-neutral-100 p-1">
          <TabsTrigger value="overview" className="gap-2">
            <FileText className="h-4 w-4" /> Interviews
          </TabsTrigger>
          <TabsTrigger value="roles" className="gap-2">
            <Briefcase className="h-4 w-4" /> Job Roles
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" /> Users
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" /> Prompts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Interview Sessions</CardTitle>
                <CardDescription>Monitor every interview conducted on the platform.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {interviews.map((i) => (
                    <TableRow key={i.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{i.userName}</span>
                        </div>
                      </TableCell>
                      <TableCell>{i.jobTitle}</TableCell>
                      <TableCell>
                        <Badge variant={i.status === 'completed' ? 'secondary' : 'outline'}>
                          {i.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>{i.score || '-'}/100</TableCell>
                      <TableCell>
                         {i.createdAt?.toDate ? i.createdAt.toDate().toLocaleDateString() : 'Now'}
                      </TableCell>
                      <TableCell className="text-right flex gap-1 justify-end">
                        <Button variant="ghost" size="sm" onClick={() => window.open(`/feedback/${i.id}`, '_blank')}>
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteInterview(i.id)} className="text-rose-500 hover:text-rose-600 hover:bg-rose-50">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Add Job Role</CardTitle>
                <CardDescription>Add new roles that users can select for interviews.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Role Title</Label>
                  <Input 
                    placeholder="e.g. Frontend Engineer" 
                    value={newRole.title}
                    onChange={e => setNewRole({ ...newRole, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description (Optional)</Label>
                  <Textarea 
                    placeholder="Briefly describe the role focus..." 
                    value={newRole.description}
                    onChange={e => setNewRole({ ...newRole, description: e.target.value })}
                  />
                </div>
                <Button className="w-full" onClick={handleAddRole}>
                  <Plus className="mr-2 h-4 w-4" /> Add Role
                </Button>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Available Roles</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobRoles.map(role => (
                      <TableRow key={role.id}>
                        <TableCell className="font-bold">{role.title}</TableCell>
                        <TableCell className="text-sm text-neutral-500">{role.description || 'No description'}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteRole(role.id)} className="text-rose-500">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
           <Card>
             <CardHeader>
               <CardTitle>User Directory</CardTitle>
               <CardDescription>Manage user accounts on the platform.</CardDescription>
             </CardHeader>
             <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map(u => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.displayName}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>
                          <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>
                            {u.role.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>{u.createdAt?.toDate ? u.createdAt.toDate().toLocaleDateString() : 'N/A'}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(u.id)} className="text-rose-500">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
             </CardContent>
           </Card>
        </TabsContent>

        <TabsContent value="settings">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="md:col-span-1 shadow-lg">
              <CardHeader>
                <CardTitle>Vapi Interviewer Prompt</CardTitle>
                <CardDescription>
                  This prompt defines how the AI interviewer behaves during the voice call.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="interviewer-prompt">System Instructions</Label>
                  <Textarea 
                    id="interviewer-prompt"
                    placeholder="Enter the prompt for the Vapi assistant..."
                    className="min-h-[300px] font-sans leading-relaxed"
                    value={config.interviewerPrompt}
                    onChange={(e) => setConfig({ ...config, interviewerPrompt: e.target.value })}
                  />
                </div>
                <p className="text-xs text-neutral-500 bg-neutral-50 p-3 rounded-lg border">
                  Tip: Use variables like <code>{'{candidateName}'}</code> and <code>{'{jobTitle}'}</code> which are passed from the frontend.
                </p>
              </CardContent>
            </Card>

            <Card className="md:col-span-1 shadow-lg">
              <CardHeader>
                <CardTitle>Gemini Feedback Prompt</CardTitle>
                <CardDescription>
                  This prompt guides Gemini in analyzing the transcript and giving scores.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="feedback-prompt">Analysis Instructions</Label>
                  <Textarea 
                    id="feedback-prompt"
                    placeholder="Enter the prompt for Gemini analysis..."
                    className="min-h-[300px] font-sans leading-relaxed"
                    value={config.feedbackPrompt}
                    onChange={(e) => setConfig({ ...config, feedbackPrompt: e.target.value })}
                  />
                </div>
                <div className="pt-4 flex justify-end">
                   <Button onClick={handleSaveConfig} disabled={isSaving} className="gap-2 px-8">
                     {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                     Save All Changes
                   </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
