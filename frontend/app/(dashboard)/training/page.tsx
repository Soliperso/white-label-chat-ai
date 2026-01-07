'use client';

import { useRouter } from 'next/navigation';
import { GraduationCap, ArrowRight, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useWidgets } from '@/hooks/use-widgets';

export default function TrainingOverviewPage() {
  const router = useRouter();
  const { data: widgets, isLoading } = useWidgets();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const activeWidgets = widgets?.filter((w) => w.status === 'active') || [];
  const draftWidgets = widgets?.filter((w) => w.status === 'draft') || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <GraduationCap className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">AI Training</h1>
        </div>
        <p className="text-muted-foreground">
          Train your AI assistants with website content, documents, and Q&A pairs
        </p>
      </div>

      {/* Active Widgets */}
      {activeWidgets.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">Active Widgets</h2>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              {activeWidgets.length}
            </Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeWidgets.map((widget) => (
              <Card key={widget.id} className="hover:border-primary transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{widget.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {widget.category || 'General Support'}
                      </CardDescription>
                    </div>
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: widget.theme.primaryColor }}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => router.push(`/widgets/${widget.id}/training`)}
                    className="w-full gap-2 text-white"
                  >
                    <Sparkles className="h-4 w-4 text-white" />
                    Manage Training
                    <ArrowRight className="h-4 w-4 ml-auto text-white" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Draft Widgets */}
      {draftWidgets.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">Draft Widgets</h2>
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
              {draftWidgets.length}
            </Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {draftWidgets.map((widget) => (
              <Card key={widget.id} className="hover:border-primary transition-colors opacity-75">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{widget.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {widget.category || 'General Support'}
                      </CardDescription>
                    </div>
                    <Badge variant="outline">Draft</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => router.push(`/widgets/${widget.id}/training`)}
                    variant="outline"
                    className="w-full gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    Manage Training
                    <ArrowRight className="h-4 w-4 ml-auto" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {(!widgets || widgets.length === 0) && (
        <Card className="border-dashed">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
              <GraduationCap className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No widgets yet</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Create a widget first to start training your AI assistant
            </p>
            <Button onClick={() => router.push('/widgets/new')} className="text-white">Create Widget</Button>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-600" />
            Training Your AI
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong>Website URLs:</strong> Add URLs to crawl and extract content from your website
          </p>
          <p>
            <strong>Upload Files:</strong> Upload PDF, DOCX, or TXT documents for training
          </p>
          <p>
            <strong>Q&A Pairs:</strong> Manually add common questions and their answers
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
