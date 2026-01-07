'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Link as LinkIcon, FileText, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useAddTrainingUrl,
  useUploadTrainingFile,
  useAddTrainingQA,
} from '@/hooks/use-training';

const trainingSourceSchema = z.object({
  type: z.enum(['url', 'file', 'qna']),
  url: z.string().optional().or(z.literal('')),
  crawlDepth: z.number().min(1).max(3).optional(),
  file: z.instanceof(File).optional(),
  question: z
    .string()
    .optional()
    .or(z.literal('')),
  answer: z
    .string()
    .optional()
    .or(z.literal('')),
}).refine(
  (data) => {
    if (data.type === 'url') return !!data.url;
    if (data.type === 'file') return !!data.file;
    if (data.type === 'qna') return !!data.question && !!data.answer;
    return false;
  },
  {
    message: 'Please fill in all required fields for the selected type',
    path: ['type'],
  }
);

type TrainingSourceFormValues = z.infer<typeof trainingSourceSchema>;

interface AddTrainingSourceFormProps {
  widgetId: string;
}

export function AddTrainingSourceForm({ widgetId }: AddTrainingSourceFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const addUrlMutation = useAddTrainingUrl();
  const uploadFileMutation = useUploadTrainingFile();
  const addQAMutation = useAddTrainingQA();

  const form = useForm<TrainingSourceFormValues>({
    resolver: zodResolver(trainingSourceSchema),
    defaultValues: {
      type: 'url',
      url: '',
      crawlDepth: 1,
      question: '',
      answer: '',
    },
  });

  const sourceType = form.watch('type');
  const isSubmitting =
    addUrlMutation.isPending || uploadFileMutation.isPending || addQAMutation.isPending;

  async function onSubmit(values: TrainingSourceFormValues) {
    try {
      if (values.type === 'url' && values.url) {
        await addUrlMutation.mutateAsync({
          widgetId,
          url: values.url,
          crawlDepth: values.crawlDepth || 1,
        });
        toast.success('URL source added successfully!');
      } else if (values.type === 'file' && values.file) {
        await uploadFileMutation.mutateAsync({
          widgetId,
          file: values.file,
        });
        toast.success('File uploaded successfully!');
      } else if (values.type === 'qna' && values.question && values.answer) {
        await addQAMutation.mutateAsync({
          widgetId,
          question: values.question,
          answer: values.answer,
        });
        toast.success('Q&A pair added successfully!');
      }

      // Reset form
      form.reset({
        type: values.type,
        url: '',
        crawlDepth: 1,
        question: '',
        answer: '',
      });
      setSelectedFile(null);
    } catch (error) {
      toast.error('Failed to add training source. Please try again.');
      console.error('Error adding training source:', error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-4">Add Training Data</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Train your AI with website content, documents, or Q&A pairs
          </p>
        </div>

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Source Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="url">
                    <div className="flex items-center gap-2">
                      <LinkIcon className="h-4 w-4" />
                      <span>Website URL</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="file">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>Upload File</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="qna">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      <span>Q&A Pair</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {sourceType === 'url' && (
          <>
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the URL to crawl for training data
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="crawlDepth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Crawl Depth</FormLabel>
                  <Select
                    onValueChange={(value: string) => field.onChange(parseInt(value))}
                    defaultValue={field.value?.toString() || '1'}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select crawl depth" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">1 level (page only)</SelectItem>
                      <SelectItem value="2">2 levels (+ linked pages)</SelectItem>
                      <SelectItem value="3">3 levels (deep crawl)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    How many link levels deep to crawl
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {sourceType === 'file' && (
          <FormField
            control={form.control}
            name="file"
            render={({ field: { onChange, value, ...field } }) => (
              <FormItem>
                <FormLabel>Upload File</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        onChange(file);
                        setSelectedFile(file);
                      }
                    }}
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Supported formats: PDF, DOCX, TXT (Max 10MB)
                </FormDescription>
                {selectedFile && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {selectedFile.name} (
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {sourceType === 'qna' && (
          <>
            <FormField
              control={form.control}
              name="question"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="What are your business hours?"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    A common question your users might ask
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="answer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Answer</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="We are open Monday-Friday 9AM-5PM EST..."
                      className="min-h-[100px]"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    The answer the AI should provide
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <Button type="submit" className="w-full text-white" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />}
          {isSubmitting ? 'Adding...' : 'Add Training Source'}
        </Button>
      </form>
    </Form>
  );
}
