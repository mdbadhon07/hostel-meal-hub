import React, { useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMeal } from '@/context/MealContext';
import { useToast } from '@/hooks/use-toast';
import { Download, Upload, Trash2, Database, HardDrive } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const Settings = () => {
  const { exportData, importData, clearAllData } = useMeal();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mess-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "সফল!",
      description: "ডাটা সফলভাবে এক্সপোর্ট হয়েছে",
    });
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const success = importData(content);
      
      if (success) {
        toast({
          title: "সফল!",
          description: "ডাটা সফলভাবে ইমপোর্ট হয়েছে",
        });
      } else {
        toast({
          title: "ত্রুটি!",
          description: "ডাটা ইমপোর্ট করতে ব্যর্থ। ফাইল ফরম্যাট সঠিক কিনা দেখুন।",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClearData = () => {
    clearAllData();
    toast({
      title: "সফল!",
      description: "সব ডাটা মুছে ফেলা হয়েছে",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">সেটিংস</h1>
        <p className="text-muted-foreground">ডাটা ব্যাকআপ ও রিস্টোর</p>
      </div>

      {/* Storage Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5 text-primary" />
            ডাটা সংরক্ষণ
          </CardTitle>
          <CardDescription>
            আপনার সব ডাটা এই ব্রাউজারের LocalStorage-এ সংরক্ষিত আছে
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Database className="h-4 w-4" />
            <span>ডাটা স্বয়ংক্রিয়ভাবে সেভ হচ্ছে</span>
          </div>
        </CardContent>
      </Card>

      {/* Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-green-500" />
            ডাটা এক্সপোর্ট
          </CardTitle>
          <CardDescription>
            সব ডাটা JSON ফাইল হিসেবে ডাউনলোড করুন
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />
            ব্যাকআপ ডাউনলোড করুন
          </Button>
        </CardContent>
      </Card>

      {/* Import */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-blue-500" />
            ডাটা ইমপোর্ট
          </CardTitle>
          <CardDescription>
            আগের ব্যাকআপ থেকে ডাটা রিস্টোর করুন (বর্তমান ডাটা প্রতিস্থাপিত হবে)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImport}
            accept=".json"
            className="hidden"
          />
          <Button 
            variant="outline" 
            onClick={() => fileInputRef.current?.click()}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            ব্যাকআপ ফাইল নির্বাচন করুন
          </Button>
        </CardContent>
      </Card>

      {/* Clear Data */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            সব ডাটা মুছুন
          </CardTitle>
          <CardDescription>
            সতর্কতা: এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="gap-2">
                <Trash2 className="h-4 w-4" />
                সব ডাটা মুছে ফেলুন
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>আপনি কি নিশ্চিত?</AlertDialogTitle>
                <AlertDialogDescription>
                  এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না। সব সদস্য, খাবার, খরচ, জমা এবং বুয়ার টাকার তথ্য মুছে যাবে।
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>বাতিল</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearData} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  হ্যাঁ, মুছে ফেলুন
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
