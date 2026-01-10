import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, User, Key, Link } from 'lucide-react';
import { toast } from 'sonner';

interface Member {
  id: string;
  name: string;
  email: string | null;
  user_id: string | null;
  is_active: boolean;
}

export default function AdminMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberPassword, setNewMemberPassword] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creatingMember, setCreatingMember] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast.error('সদস্য লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMemberName.trim()) {
      toast.error('সদস্যের নাম লিখুন');
      return;
    }

    setCreatingMember(true);

    try {
      let userId = null;

      // If email and password provided, create auth user
      if (newMemberEmail && newMemberPassword) {
        if (newMemberPassword.length < 6) {
          toast.error('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে');
          setCreatingMember(false);
          return;
        }

        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: newMemberEmail,
          password: newMemberPassword,
          options: {
            emailRedirectTo: window.location.origin,
            data: { name: newMemberName },
          },
        });

        if (authError) throw authError;
        userId = authData.user?.id;

        // Add member role
        if (userId) {
          await supabase
            .from('user_roles')
            .insert({ user_id: userId, role: 'member' });
        }
      }

      // Create member record
      const { error: memberError } = await supabase
        .from('members')
        .insert({
          name: newMemberName,
          email: newMemberEmail || null,
          user_id: userId,
        });

      if (memberError) throw memberError;

      toast.success('নতুন সদস্য যোগ করা হয়েছে!');
      setNewMemberName('');
      setNewMemberEmail('');
      setNewMemberPassword('');
      setDialogOpen(false);
      fetchMembers();
    } catch (error: any) {
      console.error('Error creating member:', error);
      if (error.message?.includes('already registered')) {
        toast.error('এই ইমেইল আগে থেকেই নিবন্ধিত');
      } else {
        toast.error('সদস্য যোগ করতে সমস্যা হয়েছে');
      }
    } finally {
      setCreatingMember(false);
    }
  };

  const handleToggleStatus = async (member: Member) => {
    try {
      const { error } = await supabase
        .from('members')
        .update({ is_active: !member.is_active })
        .eq('id', member.id);

      if (error) throw error;

      setMembers(members.map(m => 
        m.id === member.id ? { ...m, is_active: !m.is_active } : m
      ));

      toast.success(member.is_active ? 'সদস্য নিষ্ক্রিয় করা হয়েছে' : 'সদস্য সক্রিয় করা হয়েছে');
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('স্ট্যাটাস পরিবর্তন করতে সমস্যা হয়েছে');
    }
  };

  const handleRemove = async (member: Member) => {
    if (!window.confirm(`আপনি কি নিশ্চিত "${member.name}" কে সরাতে চান?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', member.id);

      if (error) throw error;

      setMembers(members.filter(m => m.id !== member.id));
      toast.success('সদস্য সরানো হয়েছে');
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('সদস্য সরাতে সমস্যা হয়েছে');
    }
  };

  const activeCount = members.filter(m => m.is_active).length;
  const linkedCount = members.filter(m => m.user_id).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">সদস্য ব্যবস্থাপনা (অ্যাডমিন)</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-card rounded-lg border border-border p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{members.length}</p>
          <p className="text-sm text-muted-foreground">মোট</p>
        </div>
        <div className="bg-success/10 rounded-lg border border-success/20 p-4 text-center">
          <p className="text-2xl font-bold text-success">{activeCount}</p>
          <p className="text-sm text-muted-foreground">সক্রিয়</p>
        </div>
        <div className="bg-primary/10 rounded-lg border border-primary/20 p-4 text-center">
          <p className="text-2xl font-bold text-primary">{linkedCount}</p>
          <p className="text-sm text-muted-foreground">লিংকড</p>
        </div>
      </div>

      {/* Add Member Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button className="w-full mb-6">
            <Plus className="mr-2" size={20} />
            নতুন সদস্য যোগ করুন
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle>নতুন সদস্য যোগ করুন</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateMember} className="space-y-4">
            <div>
              <Label htmlFor="name">নাম *</Label>
              <Input
                id="name"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                placeholder="সদস্যের নাম"
                className="mt-1"
              />
            </div>
            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-3">
                <Key className="inline mr-1" size={14} />
                লগইন তথ্য (ঐচ্ছিক - সদস্য নিজে মিল দিতে পারবে)
              </p>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="email">ইমেইল</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    placeholder="member@email.com"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="password">পাসওয়ার্ড</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newMemberPassword}
                    onChange={(e) => setNewMemberPassword(e.target.value)}
                    placeholder="কমপক্ষে ৬ অক্ষর"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={creatingMember}>
              {creatingMember ? 'তৈরি হচ্ছে...' : 'সদস্য তৈরি করুন'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Members List */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <h2 className="text-lg font-semibold p-4 border-b border-border">সদস্য তালিকা</h2>
        <div className="divide-y divide-border">
          {members.map((member) => (
            <div 
              key={member.id} 
              className={`p-4 ${!member.is_active ? 'opacity-50' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    member.is_active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                  }`}>
                    <User size={20} />
                  </div>
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <div className="flex items-center gap-2">
                      {member.email && (
                        <span className="text-xs text-muted-foreground">{member.email}</span>
                      )}
                      {member.user_id ? (
                        <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Link size={10} />
                          লিংকড
                        </span>
                      ) : (
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                          লিংক নেই
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {member.is_active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                    </span>
                    <Switch
                      checked={member.is_active}
                      onCheckedChange={() => handleToggleStatus(member)}
                    />
                  </div>
                  <button
                    onClick={() => handleRemove(member)}
                    className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {members.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              কোনো সদস্য নেই। উপরে বাটন চেপে সদস্য যোগ করুন।
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="mt-4 p-4 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground">
          <strong>টিপ:</strong> লগইন তথ্য সহ সদস্য তৈরি করলে তারা নিজেদের ফোন থেকে প্রতিদিন রাত ১০টার আগে মিল ইনপুট করতে পারবে।
        </p>
      </div>
    </div>
  );
}
