"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { VideoDisplay } from "./VIdeoDisplay";


type CodeDisplayProps = {
  code: string;
  explanation: string;
  videoUrl?: string | null;
};

export function CodeDisplay({ code, explanation, videoUrl }: CodeDisplayProps) {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Code copied to clipboard!");
    
    // Reset the copied state after 2 seconds
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Generated Animation</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={videoUrl ? "video" : "code"}>
          <TabsList className="mb-4">
            {videoUrl && <TabsTrigger value="video">Animation</TabsTrigger>}
            <TabsTrigger value="code">Manim Code</TabsTrigger>
            <TabsTrigger value="explanation">Explanation</TabsTrigger>
          </TabsList>
          
          {videoUrl && (
            <TabsContent value="video">
              <VideoDisplay videoUrl={videoUrl} />
            </TabsContent>
          )}
          
          <TabsContent value="code">
            <div className="relative">
              <div className="bg-muted rounded-md p-4">
                <pre className="overflow-x-auto max-h-[60vh] text-sm">
                  <code>{code}</code>
                </pre>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="absolute top-2 right-2"
                onClick={copyToClipboard}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="explanation">
            <div className="bg-muted rounded-md p-4 max-h-[60vh] overflow-y-auto">
              <div className="prose dark:prose-invert">
                {explanation.split('\n').map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}