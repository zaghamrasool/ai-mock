import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { useAuth } from '@/src/context/AuthContext';
import { useVapi } from '@/src/hooks/useVapi';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  Settings, 
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export default function InterviewPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { callStatus, startCall, stopCall, transcript, activeCallId } = useVapi();
  const [interview, setInterview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFinishing, setIsFinishing] = useState(false);

  useEffect(() => {
    if (!id) return;
    async function fetchInterview() {
      try {
        const interviewDoc = await getDoc(doc(db, 'interviews', id!));
        if (interviewDoc.exists()) {
          const data = interviewDoc.data();
          if (data.userId !== user?.uid) {
            toast.error("Unauthorized access");
            navigate('/dashboard');
            return;
          }
          if (data.status === 'completed') {
            navigate(`/feedback/${id}`);
            return;
          }
          setInterview({ id: interviewDoc.id, ...data });
        } else {
          toast.error("Interview not found");
          navigate('/dashboard');
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchInterview();
  }, [id, user, navigate]);

  const handleStart = async () => {
    const assistantId = (import.meta as any).env.VAPI_ASSISTANT_ID;
    if (!assistantId) {
      toast.error("Vapi Assistant ID not configured");
      return;
    }

    const overrides = {
      variableValues: {
        candidateName: user?.displayName || "Candidate",
        jobTitle: interview?.jobTitle || "Software Engineer"
      }
    };

    await startCall(assistantId, overrides);
  };

  const handleFinish = async () => {
    setIsFinishing(true);
    await stopCall();
    
    try {
      // Fetch current config for specific prompt if needed
      // For now, use the transcript recorded by the hook
      await updateDoc(doc(db, 'interviews', id!), {
        status: 'completed',
        transcript: transcript,
        vapiCallId: activeCallId,
        completedAt: new Date()
      });

      // Navigate to feedback page - feedback will be generated there
      navigate(`/feedback/${id}`);
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to save interview progress");
      setIsFinishing(false);
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
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card className="overflow-hidden border-none shadow-2xl bg-neutral-900 text-white">
            <CardHeader className="border-b border-neutral-800">
              <div className="flex justify-between items-center">
                <Badge variant="outline" className="text-neutral-400 border-neutral-800">VOICE SESSION</Badge>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${callStatus === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-600'}`} />
                  <span className="text-xs font-medium uppercase tracking-wider text-neutral-400">
                    {callStatus}
                  </span>
                </div>
              </div>
              <CardTitle className="text-3xl mt-4">AI Technical Interview</CardTitle>
              <CardDescription className="text-neutral-400">
                Position: {interview?.jobTitle} • Duration: 15-20 min
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] flex flex-col items-center justify-center p-12">
              <AnimatePresence mode="wait">
                {callStatus === 'idle' ? (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    className="text-center"
                  >
                    <div className="w-24 h-24 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-8">
                      <Mic className="h-10 w-10 text-neutral-400" />
                    </div>
                    <h3 className="text-xl font-medium mb-4">Ready to start?</h3>
                    <p className="text-neutral-400 mb-8 max-w-xs mx-auto">
                      Ensure your microphone is connected and you're in a quiet environment.
                    </p>
                    <Button size="lg" className="rounded-full px-12 h-14 text-lg bg-white text-black hover:bg-neutral-200" onClick={handleStart}>
                      Start Interview
                    </Button>
                  </motion.div>
                ) : callStatus === 'active' ? (
                  <motion.div
                    key="active"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-full flex flex-col items-center"
                  >
                    {/* Visualizer Mockup */}
                    <div className="flex items-end gap-1 h-20 mb-12">
                      {[...Array(12)].map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{ height: [10, Math.random() * 60 + 10, 10] }}
                          transition={{ repeat: Infinity, duration: 0.5 + Math.random(), ease: "easeInOut" }}
                          className="w-2 bg-emerald-500 rounded-full"
                        />
                      ))}
                    </div>
                    <p className="text-neutral-300 text-lg animate-pulse mb-12">Conversation in progress...</p>
                    <Button variant="destructive" size="lg" className="rounded-full px-10 h-14" onClick={handleFinish} disabled={isFinishing}>
                      {isFinishing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PhoneOff className="mr-2 h-5 w-5" />}
                      End Session
                    </Button>
                  </motion.div>
                ) : (
                  <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto text-white mb-6" />
                    <p className="text-xl">Connecting to AI Interviewer...</p>
                  </div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          <Card className="border-neutral-200 shadow-sm">
            <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Live Transcript</CardTitle>
              <Badge variant="outline">AI-GENERATED</Badge>
            </CardHeader>
            <CardContent className="h-[200px] overflow-y-auto p-4 bg-neutral-50/50">
              {transcript ? (
                <div className="space-y-4 font-mono text-sm">
                  {transcript.split('\n').map((line, i) => (
                    <p key={i} className={line.startsWith('Interviewer:') ? 'text-neutral-500' : 'text-neutral-900 font-medium'}>
                      {line}
                    </p>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-neutral-400">
                  <p>Transcript will appear here as you speak.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Interview Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                <p className="text-sm text-neutral-600">Speak clearly and at a moderate pace.</p>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                <p className="text-sm text-neutral-600">Use the STAR method (Situation, Task, Action, Result) for behavioral questions.</p>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                <p className="text-sm text-neutral-600">Don't be afraid to take a moment to collect your thoughts before answering.</p>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                <p className="text-sm text-neutral-600">If you don't understand a question, ask for clarification.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-neutral-50 border-neutral-200">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-neutral-900 font-semibold">
                <AlertCircle className="h-4 w-4" />
                System Requirements
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-neutral-500">Microphone</span>
                <span className="text-emerald-600 font-medium">CONNECTED</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-neutral-500">Latency</span>
                <span className="text-emerald-600 font-medium">OPTIMAL</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-neutral-500">Environment</span>
                <span className="text-neutral-500 font-medium">QUIET</span>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
               <Button variant="link" size="sm" className="p-0 text-xs text-neutral-500 h-auto">
                 <Settings className="mr-1 h-3 w-3" /> Test audio settings
               </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
