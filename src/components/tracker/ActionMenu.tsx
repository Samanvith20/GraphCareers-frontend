import { useState } from "react";
import { MoreHorizontal, ExternalLink, Pencil, Copy, Trash2, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ActionMenuProps {
  job: any;
  onEdit: (job: any) => void;
}

export function ActionMenu({ job, onEdit }: ActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 bg-[#111113] border-white/10 text-zinc-200">
        <DropdownMenuItem 
          className="cursor-pointer hover:bg-white/5"
          onClick={() => {
            if (job.jobUrl) window.open(job.jobUrl, "_blank");
          }}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          <span>Open Job</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          className="cursor-pointer hover:bg-white/5"
          onClick={() => onEdit(job)}
        >
          <Pencil className="mr-2 h-4 w-4" />
          <span>Edit</span>
        </DropdownMenuItem>
        
        {/* <DropdownMenuItem className="cursor-pointer hover:bg-white/5">
          <Copy className="mr-2 h-4 w-4" />
          <span>Duplicate</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem className="cursor-pointer hover:bg-white/5">
          <Archive className="mr-2 h-4 w-4" />
          <span>Archive</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="bg-white/10" />
        
        <DropdownMenuItem className="cursor-pointer hover:bg-red-500/10 text-red-400 hover:text-red-400">
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Delete</span>
        </DropdownMenuItem> */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
