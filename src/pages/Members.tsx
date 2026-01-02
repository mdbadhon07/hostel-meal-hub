import { useState } from 'react';
import { useMeal } from '@/context/MealContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, User } from 'lucide-react';
import { toast } from 'sonner';

export default function Members() {
  const { members, addMember, removeMember, toggleMemberStatus } = useMeal();
  const [newMemberName, setNewMemberName] = useState('');

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) {
      toast.error('সদস্যের নাম লিখুন');
      return;
    }
    addMember(newMemberName.trim());
    setNewMemberName('');
    toast.success('নতুন সদস্য যোগ করা হয়েছে!');
  };

  const handleRemove = (id: string, name: string) => {
    if (window.confirm(`আপনি কি নিশ্চিত "${name}" কে সরাতে চান?`)) {
      removeMember(id);
      toast.success('সদস্য সরানো হয়েছে');
    }
  };

  const activeCount = members.filter(m => m.isActive).length;
  const inactiveCount = members.filter(m => !m.isActive).length;

  return (
    <div>
      <h1 className="page-title">সদস্য ব্যবস্থাপনা</h1>

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
        <div className="bg-muted rounded-lg border border-border p-4 text-center">
          <p className="text-2xl font-bold text-muted-foreground">{inactiveCount}</p>
          <p className="text-sm text-muted-foreground">নিষ্ক্রিয়</p>
        </div>
      </div>

      {/* Add Member Form */}
      <form onSubmit={handleAddMember} className="bg-card rounded-lg border border-border p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">নতুন সদস্য যোগ করুন</h2>
        <div className="flex gap-3">
          <Input
            type="text"
            placeholder="সদস্যের নাম লিখুন"
            value={newMemberName}
            onChange={(e) => setNewMemberName(e.target.value)}
            className="h-12 flex-1"
          />
          <Button type="submit" className="h-12 px-6">
            <Plus size={20} />
          </Button>
        </div>
      </form>

      {/* Members List */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <h2 className="text-lg font-semibold p-4 border-b border-border">সদস্য তালিকা</h2>
        <div className="divide-y divide-border">
          {members.map((member, index) => (
            <div 
              key={member.id} 
              className={`p-4 flex items-center justify-between ${!member.isActive ? 'opacity-50' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  member.isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                }`}>
                  <User size={20} />
                </div>
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-xs text-muted-foreground">
                    সদস্য #{index + 1}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {member.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                  </span>
                  <Switch
                    checked={member.isActive}
                    onCheckedChange={() => toggleMemberStatus(member.id)}
                  />
                </div>
                <button
                  onClick={() => handleRemove(member.id, member.name)}
                  className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Note */}
      <p className="text-sm text-muted-foreground mt-4 text-center">
        নিষ্ক্রিয় সদস্যরা দৈনিক মিল তালিকায় দেখা যাবে না
      </p>
    </div>
  );
}
