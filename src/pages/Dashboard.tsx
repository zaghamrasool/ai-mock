import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, orderBy, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { useAuth } from '@/src/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  History, 
  Calendar, 
  ArrowUpRight,
  Loader2,
  Video
} from 'lucide-react';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState<any[]>([]);
  const [jobRoles, setJobRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [showRoleModal, setShowRoleModal] = useState(false);

  useEffect(() => {
    if (!user) return;

    async function fetchData() {
      try {
        const interviewQ = query(
          collection(db, 'interviews'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const interviewSnap = await getDocs(interviewQ);
        setInterviews(interviewSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const rolesSnap = await getDocs(query(collection(db, 'jobRoles'), orderBy('title', 'asc')));
        const roles = rolesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
        setJobRoles(roles);
        if (roles.length > 0) setSelectedRole(roles[0].title);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  const handleStartNew = async () => {
    if (!user) return;
    if (!selectedRole) {
      toast.error("Please select a job role first");
      return;
    }
    setIsCreating(true);
    try {
      const interviewRef = await addDoc(collection(db, 'interviews'), {
        userId: user.uid,
        userName: user.displayName,
        jobTitle: selectedRole,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      navigate(`/interview/${interviewRef.id}`);
    } catch (error) {
      console.error("Create error:", error);
      toast.error("Failed to start interview");
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Welcome back, {user?.displayName?.split(' ')[0]}</h1>
          <p className="text-neutral-500">Practice your interview skills and review your progress.</p>
        </div>

        <Dialog open={showRoleModal} onOpenChange={setShowRoleModal}>
          <DialogTrigger className="inline-flex items-center justify-center rounded-full text-lg h-12 px-8 bg-neutral-900 text-white hover:bg-neutral-800 transition-colors cursor-pointer shadow-lg hover:shadow-xl">
              <Plus className="mr-2 h-5 w-5" />
              New Mock Interview
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Choose Your Focus</DialogTitle>
              <DialogDescription>
                Select the job role you want to practice for today.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role">Job Position</Label>
                {jobRoles.length > 0 ? (
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {jobRoles.map((role) => (
                        <SelectItem key={role.id} value={role.title}>
                          {role.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm text-neutral-500 italic">No job roles defined by admin yet.</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleStartNew} disabled={isCreating || jobRoles.length === 0}>
                {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Start Interview"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card className="bg-neutral-900 text-white border-none shadow-xl">
          <CardHeader className="pb-2">
            <CardDescription className="text-neutral-400">Total Interviews</CardDescription>
            <CardTitle className="text-4xl">{interviews.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-emerald-400 text-sm">
              <ArrowUpRight className="h-4 w-4" />
              <span>+2 this week</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-neutral-200">
          <CardHeader className="pb-2">
            <CardDescription>Average Score</CardDescription>
            <CardTitle className="text-4xl">
              {interviews.filter(i => i.score).length > 0
                ? Math.round(interviews.reduce((acc, i) => acc + (i.score || 0), 0) / interviews.filter(i => i.score).length)
                : 'N/A'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-500 text-sm">Based on completed sessions</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-neutral-200">
          <CardHeader className="pb-2">
            <CardDescription>Time Practiced</CardDescription>
            <CardTitle className="text-4xl">{interviews.length * 15}m</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-500 text-sm">Total estimated time</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <History className="h-6 w-6" />
          Recent Sessions
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="h-[200px] animate-pulse bg-neutral-100" />
            ))}
          </div>
        ) : interviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {interviews.map((interview, index) => (
              <motion.div
                key={interview.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                onClick={() => navigate(interview.status === 'completed' ? `/feedback/${interview.id}` : `/interview/${interview.id}`)}
                className="cursor-pointer"
              >
                <Card className="hover:border-neutral-400 transition-colors shadow-sm group">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <Badge variant={interview.status === 'completed' ? 'secondary' : 'outline'}>
                        {interview.status.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-neutral-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {interview.createdAt?.toDate ? format(interview.createdAt.toDate(), 'MMM dd, yyyy') : 'Recently'}
                      </span>
                    </div>
                    <CardTitle className="mt-2 text-xl group-hover:text-neutral-600 transition-colors">
                      {interview.jobTitle} Interview
                    </CardTitle>
                    <CardDescription>
                      {interview.status === 'completed' ? `Score: ${interview.score || 0}/100` : 'Resume your practice session'}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button variant="ghost" className="w-full justify-between p-0 hover:bg-transparent">
                      <span className="text-sm font-medium">
                        {interview.status === 'completed' ? 'View detailed feedback' : 'Continue interview'}
                      </span>
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="border-dashed py-20 text-center">
            <div className="max-w-xs mx-auto">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="h-8 w-8 text-neutral-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">No interviews yet</h3>
              <p className="text-neutral-500 mb-6">Start your first AI mock interview to sharpen your skills.</p>
              <Button onClick={handleStartNew}>Start First Interview</Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
