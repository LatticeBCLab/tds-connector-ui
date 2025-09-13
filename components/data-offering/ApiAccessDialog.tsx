"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle2, Copy, Globe, Loader2, Lock, Send, XCircle } from "lucide-react";
import { useState } from "react";

interface ApiConfig {
  method: "GET" | "POST";
  apiEndpoint: string;
  authentication: {
    type: "none" | "bearer" | "basic";
    token?: string;
    username?: string;
    password?: string;
  };
}

interface ApiAccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiConfig: ApiConfig;
  offeringTitle?: string;
}

export function ApiAccessDialog({
  open,
  onOpenChange,
  apiConfig,
  offeringTitle,
}: ApiAccessDialogProps) {
  const { toast } = useToast();
  const [method, setMethod] = useState<"GET" | "POST">(apiConfig.method);
  const [endpoint, setEndpoint] = useState(apiConfig.apiEndpoint);
  const [requestBody, setRequestBody] = useState("{}");
  const [headers, setHeaders] = useState("{}");
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);

  const handleSendRequest = async () => {
    setLoading(true);
    setResponse("");
    setResponseStatus(null);

    try {
      let parsedHeaders = {};
      let parsedBody = null;

      // Parse request headers
      try {
        parsedHeaders = JSON.parse(headers);
      } catch (e) {
        parsedHeaders = {};
      }

      // Add authentication headers
      if (apiConfig.authentication.type === "bearer" && apiConfig.authentication.token) {
        parsedHeaders = {
          ...parsedHeaders,
          Authorization: `Bearer ${apiConfig.authentication.token}`,
        };
      } else if (apiConfig.authentication.type === "basic" && apiConfig.authentication.username && apiConfig.authentication.password) {
        const credentials = btoa(`${apiConfig.authentication.username}:${apiConfig.authentication.password}`);
        parsedHeaders = {
          ...parsedHeaders,
          Authorization: `Basic ${credentials}`,
        };
      }

      // If it's a POST request, parse the request body
      if (method === "POST") {
        try {
          parsedBody = JSON.parse(requestBody);
          parsedHeaders = {
            ...parsedHeaders,
            "Content-Type": "application/json",
          };
        } catch (e) {
          toast({
            title: "Request Body Format Error",
            description: "Please enter valid JSON format",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
      }

      const fetchOptions: RequestInit = {
        method,
        headers: parsedHeaders,
      };

      if (method === "POST" && parsedBody) {
        fetchOptions.body = JSON.stringify(parsedBody);
      }

      const res = await fetch(endpoint, fetchOptions);
      setResponseStatus(res.status);

      const responseText = await res.text();
      let formattedResponse = responseText;

      // Try to format JSON response
      try {
        const jsonResponse = JSON.parse(responseText);
        formattedResponse = JSON.stringify(jsonResponse, null, 2);
      } catch (e) {
        // If not JSON format, keep as is
      }

      setResponse(formattedResponse);

      if (!res.ok) {
        toast({
          title: "Request Failed",
          description: `Status Code: ${res.status}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Request Successful",
          description: `Status Code: ${res.status}`,
        });
      }
    } catch (error) {
      setResponse(`Error: ${error instanceof Error ? error.message : "Unknown Error"}`);
      toast({
        title: "Request Failed",
        description: error instanceof Error ? error.message : "Unknown Error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
    });
  };

  const getStatusBadgeVariant = (status: number | null) => {
    if (!status) return "secondary";
    if (status >= 200 && status < 300) return "default";
    if (status >= 400) return "destructive";
    return "secondary";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="pb-4 flex-shrink-0">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="flex flex-col">
              <span>API Interface Call</span>
              {offeringTitle && (
                <span className="text-sm text-muted-foreground font-normal">
                  Testing API for {offeringTitle}
                </span>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 flex-1 overflow-hidden">
          {/* Request configuration area */}
          <Card className="border-0 shadow-sm bg-muted/20 flex-shrink-0">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Globe className="size-5 text-blue-600" />
                Request Configuration
              </CardTitle>
              <CardDescription>Configure your API request parameters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-foreground">Request Method</Label>
                  <Select value={method} onValueChange={(value) => setMethod(value as "GET" | "POST")}>
                    <SelectTrigger className="h-11 border-2 border-muted-foreground/20 hover:border-primary/50 transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET" className="cursor-pointer">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          GET
                        </div>
                      </SelectItem>
                      <SelectItem value="POST" className="cursor-pointer">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          POST
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3 md:col-span-2">
                  <Label className="text-sm font-semibold text-foreground">API Endpoint</Label>
                  <Input
                    className="h-11 border-2 border-muted-foreground/20 hover:border-primary/50 focus:border-primary transition-colors font-mono text-sm"
                    value={endpoint}
                    onChange={(e) => setEndpoint(e.target.value)}
                    placeholder="https://api.example.com/endpoint"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-foreground">Send Request</Label>
                  <Button 
                    onClick={handleSendRequest} 
                    disabled={loading || !endpoint}
                    className="w-full h-11 text-sm font-semibold"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Advanced Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-foreground">Request Headers <span className="text-xs text-muted-foreground">(JSON format)</span></Label>
                  <Textarea
                    className="border-2 border-muted-foreground/20 hover:border-primary/50 focus:border-primary transition-colors font-mono text-xs resize-none"
                    value={headers}
                    onChange={(e) => setHeaders(e.target.value)}
                    placeholder='{\n  "Content-Type": "application/json",\n  "Accept": "application/json"\n}'
                    rows={3}
                  />
                </div>

                {method === "POST" && (
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">Request Body <span className="text-xs text-muted-foreground">(JSON format)</span></Label>
                    <Textarea
                      className="border-2 border-muted-foreground/20 hover:border-primary/50 focus:border-primary transition-colors font-mono text-xs resize-none"
                      value={requestBody}
                      onChange={(e) => setRequestBody(e.target.value)}
                      placeholder='{\n  "key": "value",\n  "data": {\n    "example": true\n  }\n}'
                      rows={3}
                    />
                  </div>
                )}
              </div>

              {apiConfig.authentication.type !== "none" && (
                <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-lg border border-amber-200 dark:border-amber-800 mt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Lock className="size-4 text-amber-600" />
                    <span className="text-sm font-semibold text-amber-800 dark:text-amber-200">Authentication Configured</span>
                  </div>
                  <div className="text-sm text-amber-700 dark:text-amber-300">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                      Type: {apiConfig.authentication.type.toUpperCase()}
                      {apiConfig.authentication.type === "bearer" && " (Token)"}
                      {apiConfig.authentication.type === "basic" && " (Username/Password)"}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Response area */}
          <Card className="border-0 shadow-sm bg-muted/20 flex-1 flex flex-col min-h-0">
            <CardHeader className="flex-shrink-0">
              <CardTitle className="flex items-center gap-2 text-lg">
                {responseStatus ? (
                  responseStatus >= 200 && responseStatus < 300 ? (
                    <CheckCircle2 className="size-5 text-green-600" />
                  ) : (
                    <XCircle className="size-5 text-red-600" />
                  )
                ) : (
                  <Copy className="size-5 text-gray-600" />
                )}
                Response Result
              </CardTitle>
              <CardDescription>API response will appear here</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {responseStatus && (
                    <Badge 
                      variant={getStatusBadgeVariant(responseStatus)}
                      className="px-3 py-1 text-sm font-semibold"
                    >
                      {responseStatus >= 200 && responseStatus < 300 && (
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                      )}
                      {responseStatus >= 400 && (
                        <XCircle className="mr-1 h-3 w-3" />
                      )}
                      {responseStatus}
                    </Badge>
                  )}
                  {response && (
                    <span className="text-xs text-muted-foreground">
                      {response.length} characters
                    </span>
                  )}
                </div>
                {response && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(response)}
                    className="h-8 px-3"
                  >
                    <Copy className="size-3 mr-1" />
                    Copy
                  </Button>
                )}
              </div>

              <div className="flex-1 border-2 rounded-lg border-muted-foreground/20 bg-background overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="p-4">
                    {response ? (
                      <pre className="text-sm whitespace-pre-wrap break-words font-mono leading-relaxed">
                        {response}
                      </pre>
                    ) : (
                      <div className="flex flex-col items-center justify-center min-h-[200px] text-center">
                        <div className="p-6 rounded-full bg-muted/50 mb-4">
                          <Send className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                          Ready to Send Request
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                          Configure your request parameters and click &quot;Send Request&quot; to see the API response here
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}