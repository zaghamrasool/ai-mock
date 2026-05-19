import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { useAuth } from '@/src/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  MessageSquare, 
  ThumbsUp, 
  Target, 
  ArrowRight,
  Loader2,
  Sparkles,
  Download,
  Share2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export default function FeedbackPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [interview, setInterview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!id) return;
    async function fetchInterview() {
      try {
        const interviewDoc = await getDoc(doc(db, 'interviews', id!));
        if (interviewDoc.exists()) {
          const data = interviewDoc.data();
          setInterview({ id: interviewDoc.id, ...data });
          
          // If transcript exists but no feedback, generate it
          if (data.transcript && !data.feedback) {
            generateFeedback(data.transcript, data.jobTitle);
          }
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
  }, [id, navigate]);

  const generateFeedback = async (transcript: string, jobTitle: string) => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, jobTitle })
      });
      
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      // Update Firestore with feedback and score
      await updateDoc(doc(db, 'interviews', id!), {
        feedback: data.feedback,
        score: data.score,
        updatedAt: new Date()
      });

      setInterview((prev: any) => ({
        ...prev,
        feedback: data.feedback,
        score: data.score
      }));
      
      toast.success("Feedback generated successfully!");
    } catch (error) {
      console.error("Feedback error:", error);
      toast.error("Failed to generate AI feedback");
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  const score = interview?.score || 0;
  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-emerald-600';
    if (s >= 60) return 'text-amber-600';
    return 'text-rose-600';
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <Badge className="mb-2" variant="outline">FEEDBACK REPORT</Badge>
          <h1 className="text-4xl font-bold text-neutral-900">{interview?.jobTitle} Interview</h1>
          <p className="text-neutral-500">Conducted on {interview?.createdAt?.toDate().toLocaleDateString()}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" /> Download
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="mr-2 h-4 w-4" /> Share
          </Button>
          <Link to="/dashboard">
            <Button size="sm">Done</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card className="text-center p-6 border-none shadow-xl bg-neutral-900 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Trophy className="h-24 w-24" />
            </div>
            <CardHeader className="p-0 mb-4">
              <CardDescription className="text-neutral-400">Overall Score</CardDescription>
              <CardTitle className={`text-6xl font-black ${getScoreColor(score)}`}>
                {isGenerating ? <Loader2 className="h-10 w-10 animate-spin mx-auto text-white" /> : score}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
               <p className="text-sm text-neutral-400">Out of 100 points</p>
               <div className="mt-8 w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                 <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${score}%` }}
                   transition={{ duration: 1, ease: "easeOut" }}
                   className={`h-full ${score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`}
                 />
               </div>
            </CardContent>
          </Card>

          <Card shadow-sm>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-neutral-500">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Target className="h-5 w-5 text-neutral-400" />
                <div>
                  <p className="text-xs text-neutral-500">Top Skill</p>
                  <p className="text-sm font-medium">Communication</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ThumbsUp className="h-5 w-5 text-neutral-400" />
                <div>
                  <p className="text-xs text-neutral-500">Key Strength</p>
                  <p className="text-sm font-medium">Clarity of thought</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-neutral-400" />
                <div>
                  <p className="text-xs text-neutral-500">Duration</p>
                  <p className="text-sm font-medium">18 Minutes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3 space-y-8">
          {isGenerating ? (
            <Card className="border-dashed border-2 py-20 text-center">
              <Sparkles className="h-12 w-12 text-neutral-300 mx-auto mb-4 animate-pulse" />
              <h3 className="text-lg font-medium">Analyzing your interview...</h3>
              <p className="text-neutral-500 max-w-sm mx-auto mt-2">
                Our AI is reviewing your transcript to provide detailed feedback and scoring. This usually takes 10-15 seconds.
              </p>
              <div className="mt-8 flex justify-center gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                    className="w-2 h-2 bg-black rounded-full"
                  />
                ))}
              </div>
            </Card>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="shadow-sm border-neutral-200">
                <CardHeader className="border-b bg-neutral-50/50">
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-amber-500" />
                    Detailed AI Feedback
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 prose prose-neutral max-w-none">
                  <ReactMarkdown>{interview?.feedback || "No feedback generated yet."}</ReactMarkdown>
                </CardContent>
              </Card>

              <Card className="mt-8 border-neutral-200 shadow-sm overflow-hidden">
                <CardHeader 
                  className="cursor-pointer hover:bg-neutral-50 transition-colors flex flex-row items-center justify-between"
                  onClick={() => {
                    const el = document.getElementById('transcript-content');
                    if (el) el.classList.toggle('hidden');
                  }}
                >
                  <CardTitle className="text-lg">View Full Transcript</CardTitle>
                  <ArrowRight className="h-4 w-4 transform rotate-90" />
                </CardHeader>
                <CardContent id="transcript-content" className="hidden p-0 border-t">
                  <div className="bg-neutral-900 p-8 text-neutral-300 font-mono text-sm leading-relaxed whitespace-pre-wrap max-h-[500px] overflow-y-auto">
                    {interview?.transcript || "Transcript not available."}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
