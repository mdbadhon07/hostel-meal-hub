import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { LogIn, UserPlus, Utensils } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      toast.error('ইমেইল এবং পাসওয়ার্ড দিন');
      return;
    }

    if (isSignUp && !name.trim()) {
      toast.error('নাম লিখুন');
      return;
    }

    if (password.length < 6) {
      toast.error('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে');
      return;
    }

    setLoading(true);

    if (isSignUp) {
      const { error } = await signUp(email, password, name);
      setLoading(false);

      if (error) {
        if (error.message?.includes('already registered')) {
          toast.error('এই ইমেইল আগে থেকেই নিবন্ধিত। লগইন করুন।');
        } else {
          toast.error('সাইন আপ ব্যর্থ হয়েছে। আবার চেষ্টা করুন।');
        }
      } else {
        toast.success('সাইন আপ সফল! এখন লগইন করুন।');
        setIsSignUp(false);
      }
    } else {
      const { error } = await signIn(email, password);
      setLoading(false);

      if (error) {
        toast.error('লগইন ব্যর্থ হয়েছে। ইমেইল বা পাসওয়ার্ড সঠিক নয়।');
      } else {
        toast.success('সফলভাবে লগইন হয়েছে!');
        navigate('/');
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-lg border border-border p-6 shadow-lg">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Utensils className="text-primary-foreground" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-foreground">মেস ম্যানেজার</h1>
            <p className="text-muted-foreground mt-2">
              {isSignUp ? 'নতুন অ্যাকাউন্ট তৈরি করুন' : 'আপনার অ্যাকাউন্টে লগইন করুন'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <Label htmlFor="name">নাম</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="আপনার নাম"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1"
                />
              </div>
            )}

            <div>
              <Label htmlFor="email">ইমেইল</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="password">পাসওয়ার্ড</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
              />
              {isSignUp && (
                <p className="text-xs text-muted-foreground mt-1">কমপক্ষে ৬ অক্ষর</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={loading}
            >
              {loading ? (
                isSignUp ? 'সাইন আপ হচ্ছে...' : 'লগইন হচ্ছে...'
              ) : (
                <>
                  {isSignUp ? <UserPlus className="mr-2" size={20} /> : <LogIn className="mr-2" size={20} />}
                  {isSignUp ? 'সাইন আপ করুন' : 'লগইন করুন'}
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-primary hover:underline"
            >
              {isSignUp ? 'ইতিমধ্যে অ্যাকাউন্ট আছে? লগইন করুন' : 'নতুন অ্যাকাউন্ট তৈরি করুন'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
