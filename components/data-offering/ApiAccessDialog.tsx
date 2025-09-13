"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  CheckCircle2,
  Clock,
  Loader2,
  Lock,
  Send,
  XCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("apiAccessDialog");
  const { toast } = useToast();
  const [method, setMethod] = useState<"GET" | "POST">(apiConfig.method);
  const [endpoint, setEndpoint] = useState(apiConfig.apiEndpoint);
  const [requestBody, setRequestBody] = useState("{}");
  const [headers, setHeaders] = useState("{}");
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);

  const handleSendRequest = async () => {
    setLoading(true);
    setResponse("");
    setResponseStatus(null);
    setResponseTime(null);

    const startTime = Date.now();

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
      if (
        apiConfig.authentication.type === "bearer" &&
        apiConfig.authentication.token
      ) {
        parsedHeaders = {
          ...parsedHeaders,
          Authorization: `Bearer ${apiConfig.authentication.token}`,
        };
      } else if (
        apiConfig.authentication.type === "basic" &&
        apiConfig.authentication.username &&
        apiConfig.authentication.password
      ) {
        const credentials = btoa(
          `${apiConfig.authentication.username}:${apiConfig.authentication.password}`
        );
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
            title: t("requestBodyFormatError"),
            description: t("enterValidJson"),
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
      const endTime = Date.now();
      setResponseStatus(res.status);
      setResponseTime(endTime - startTime);

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
          title: t("requestFailed"),
          description: `${t("statusCode")}: ${res.status}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: t("requestSuccessful"),
          description: `${t("statusCode")}: ${res.status}`,
        });
      }
    } catch (error) {
      setResponse(
        `Error: ${error instanceof Error ? error.message : t("unknownError")}`
      );
      toast({
        title: t("requestFailed"),
        description: error instanceof Error ? error.message : t("unknownError"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: t("copiedToClipboard"),
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
      <DialogContent className="flex max-w-7xl flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl font-semibold">
            {t("title")}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Main Request Area - Postman Style */}
          <div className="flex-shrink-0 space-y-4">
            {/* Request Line */}
            <div className="flex items-center gap-3">
              <Select
                value={method}
                onValueChange={(value) => setMethod(value as "GET" | "POST")}
              >
                <SelectTrigger className="border-border font-semibold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">
                    <span className="font-semibold text-green-600">GET</span>
                  </SelectItem>
                  <SelectItem value="POST">
                    <span className="font-semibold text-blue-600">POST</span>
                  </SelectItem>
                </SelectContent>
              </Select>

              <Input
                className="border-border h-9 flex-1 font-mono text-sm"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                placeholder={t("enterRequestUrl")}
              />

              <Button
                onClick={handleSendRequest}
                disabled={loading || !endpoint}
                className="h-9"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    {t("sending")}
                  </>
                ) : (
                  <>
                    <Send className="size-4" />
                    {t("send")}
                  </>
                )}
              </Button>
            </div>

            {/* Auth Info */}
            {apiConfig.authentication.type !== "none" && (
              <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 dark:border-amber-800 dark:bg-amber-950/20">
                <Lock className="h-4 w-4 text-amber-600" />
                <span className="text-sm text-amber-800 dark:text-amber-200">
                  <span className="font-semibold">{t("auth")}:</span>{" "}
                  {apiConfig.authentication.type.toUpperCase()}
                  {apiConfig.authentication.type === "bearer" &&
                    ` ${t("token")}`}
                  {apiConfig.authentication.type === "basic" &&
                    ` ${t("usernamePassword")}`}
                </span>
              </div>
            )}

            {/* Request Configuration Tabs */}
            <Tabs defaultValue="headers" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="headers">{t("headers")}</TabsTrigger>
                <TabsTrigger value="body" disabled={method === "GET"}>
                  {t("body")}
                  {method === "GET" && (
                    <span className="ml-1 text-xs opacity-50">(GET)</span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="params">{t("params")}</TabsTrigger>
              </TabsList>

              <TabsContent value="headers" className="mt-4 space-y-3">
                <Label className="text-sm font-medium">
                  {t("requestHeaders")}
                </Label>
                <Textarea
                  className="border-border h-24 resize-none font-mono text-sm"
                  value={headers}
                  onChange={(e) => setHeaders(e.target.value)}
                  placeholder={t("headersPlaceholder")}
                />
              </TabsContent>

              <TabsContent value="body" className="mt-4 space-y-3">
                <Label className="text-sm font-medium">
                  {t("requestBody")}
                </Label>
                <Textarea
                  className="border-border h-24 resize-none font-mono text-sm"
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  placeholder={t("bodyPlaceholder")}
                />
              </TabsContent>

              <TabsContent value="params" className="mt-4 space-y-3">
                <Label className="text-sm font-medium">
                  {t("queryParameters")}
                </Label>
                <div className="text-muted-foreground text-sm">
                  {t("addQueryParametersNote")}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Response Area */}
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-shrink-0 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{t("response")}</h3>
                <div className="flex items-center gap-3">
                  {responseStatus && (
                    <Badge
                      variant={getStatusBadgeVariant(responseStatus)}
                      className="px-3 py-1 font-semibold"
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
                  {responseTime && (
                    <Badge variant="outline" className="px-3 py-1">
                      <Clock className="h-3 w-3" />
                      {responseTime}ms
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-muted/20 overflow-hidden rounded-lg border-2 border-dotted">
              <ScrollArea className="max-h-[50vh]">
                <div className="p-4">
                  {response ? (
                    <ScrollArea className="max-h-[50vh]">
                      <pre className="font-mono text-sm leading-relaxed break-words whitespace-pre-wrap">
                        {response}
                      </pre>
                    </ScrollArea>
                  ) : (
                    <div className="flex min-h-[300px] flex-col items-center justify-center space-y-2 text-center">
                      <div className="bg-muted/50 rounded-full">
                        <Send className="text-muted-foreground h-12 w-12" />
                      </div>
                      <h3 className="text-muted-foreground text-base font-semibold">
                        {t("readyToTest")}
                      </h3>
                      <p className="text-muted-foreground max-w-md text-sm">
                        {t("configureRequest")}
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}