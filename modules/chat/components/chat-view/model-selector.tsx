"use client";

import { useState } from "react";
import { Check, ChevronDown, Info, Search, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

type ModelSelectorProps = {
  models?: any[];
  selectedModelId?: string;
  onModelSelect: (modelId: string) => void;
  className?: string;
};

const ModelSelector = ({
  models,
  selectedModelId,
  onModelSelect,
  className,
}: ModelSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedForDetails, setSelectedForDetails] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const modelList = Array.isArray(models) ? models : [];
  const selectedModel = modelList.find((model) => model.id === selectedModelId);

  const formatContextLength = (length: number | null | undefined) => {
    if (length == null) {
      return "0";
    }
    if (length >= 1000000) return `${(length / 1000000).toFixed(1)}M`;
    if (length >= 1000) return `${(length / 1000).toFixed(0)}K`;
    return String(length);
  };

  const isFreeModel = (model: any) => {
    return (
      model?.pricing?.prompt === "0" &&
      model?.pricing?.completion === "0" &&
      model?.pricing?.request === "0"
    );
  };

  const openModelDetails = (model: any, e: any) => {
    e.stopPropagation();
    setSelectedForDetails(model);
    setDetailsOpen(true);
  };

  const filteredModels = modelList.filter((model: any) => {
    const query = searchQuery.toLowerCase();
    const name = model.name || "";
    const description = model.description || "";
    const id = model.id || "";
    const modality = model.architecture?.modality || "";
    return (
      name.toLowerCase().includes(query) ||
      description.toLowerCase().includes(query) ||
      id.toLowerCase().includes(query) ||
      modality.toLowerCase().includes(query)
    );
  });

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          role="combobox"
          aria-expanded={open}
          disabled={modelList.length === 0}
          className={cn(
            "inline-flex h-8 items-center justify-between gap-2 rounded-lg border border-transparent bg-clip-padding px-2 text-xs font-medium whitespace-nowrap transition-all outline-none select-none hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
            className
          )}
        >
          <div className="flex min-w-0 items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate font-medium">
              {selectedModel?.name || "Select model"}
            </span>
          </div>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
        </PopoverTrigger>

        <PopoverContent className="w-[32rem] p-0" align="start">
          <div className="border-b p-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search models..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-9"
              />
            </div>
          </div>

          <ScrollArea className="h-[400px]">
            <div className="p-2">
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                Available Models ({filteredModels.length})
              </div>

              {filteredModels.length === 0 ? (
                <div className="px-2 py-8 text-center text-sm text-muted-foreground">
                  No models found matching {searchQuery}
                </div>
              ) : (
                filteredModels.map((model) => (
                  <div
                    key={model.id}
                    className={cn(
                      "relative flex cursor-pointer select-none items-start gap-2 rounded-md px-2 py-2 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground",
                      selectedModelId === model.id && "bg-accent"
                    )}
                    onClick={() => {
                      onModelSelect(model.id);
                      setOpen(false);
                      setSearchQuery("");
                    }}
                  >
                    <div className="flex h-5 items-center">
                      <Check
                        className={cn(
                          "h-4 w-4",
                          selectedModelId === model.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium leading-none">
                          {model.name}
                        </span>
                        {isFreeModel(model) && (
                          <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                            FREE
                          </Badge>
                        )}
                      </div>

                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {model.description}
                      </p>

                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span>Context: {formatContextLength(model.context_length)}</span>
                        <span>-</span>
                        <span className="capitalize">
                          {model.architecture?.modality?.replace("->", " -> ")}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md hover:bg-muted"
                      onClick={(e) => openModelDetails(model, e)}
                    >
                      <Info className="h-3.5 w-3.5" />
                      <span className="sr-only">View details</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="flex h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-2xl flex-col overflow-hidden rounded-2xl sm:h-[min(85vh,46rem)] sm:w-full sm:rounded-xl">
          <DialogHeader className="shrink-0 pr-8">
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              {selectedForDetails?.name}
            </DialogTitle>
            <DialogDescription>
              Detailed information about this AI model
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto pr-2 sm:pr-4">
            {selectedForDetails && (
              <div className="space-y-6 pb-2">
                <div>
                  <h3 className="mb-2 text-sm font-semibold">Description</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {selectedForDetails.description}
                  </p>
                </div>

                <Separator />

                <div>
                  <h3 className="mb-3 text-sm font-semibold">Context & Capabilities</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Context Length</p>
                      <p className="text-sm font-medium">
                        {formatContextLength(selectedForDetails.context_length)} tokens
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Max Completion Tokens</p>
                      <p className="text-sm font-medium">
                        {formatContextLength(
                          selectedForDetails.top_provider?.max_completion_tokens
                        )}{" "}
                        tokens
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Modality</p>
                      <p className="text-sm font-medium capitalize">
                        {selectedForDetails.architecture?.modality?.replace("->", " -> ")}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Tokenizer</p>
                      <p className="text-sm font-medium">
                        {selectedForDetails.architecture?.tokenizer}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="mb-3 text-sm font-semibold">Supported Modalities</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">Input Modalities</p>
                      <div className="flex flex-wrap gap-1">
                        {(selectedForDetails.architecture?.input_modalities || []).map(
                          (modality: string) => (
                            <Badge key={modality} variant="outline" className="text-xs">
                              {modality}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">Output Modalities</p>
                      <div className="flex flex-wrap gap-1">
                        {(selectedForDetails.architecture?.output_modalities || []).map(
                          (modality: string) => (
                            <Badge key={modality} variant="outline" className="text-xs">
                              {modality}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="mb-3 text-sm font-semibold">Pricing</h3>
                  {isFreeModel(selectedForDetails) ? (
                    <div className="flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 p-3">
                      <Badge variant="secondary" className="bg-green-500/20">
                        FREE
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        This model is completely free to use
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(selectedForDetails.pricing || {}).map(([key, value]: [string, any]) => {
                        if (value === "0") return null;

                        return (
                          <div key={key} className="space-y-1">
                            <p className="text-xs text-muted-foreground capitalize">
                              {key.replace("_", " ")}
                            </p>
                            <p className="text-sm font-medium">${value}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <Separator />

                <div>
                  <h3 className="mb-3 text-sm font-semibold">Provider Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Content Moderation
                      </span>
                      <Badge
                        variant={
                          selectedForDetails.top_provider?.is_moderated
                            ? "default"
                            : "secondary"
                        }
                      >
                        {selectedForDetails.top_provider?.is_moderated
                          ? "Enabled"
                          : "Disabled"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 text-sm font-semibold">Model ID</h3>
                  <code className="block break-all rounded bg-muted px-2 py-1 text-xs">
                    {selectedForDetails.id}
                  </code>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ModelSelector;
