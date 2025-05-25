'use client';

import { useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ModeratorApplicationForm from "./ModeratorApplicationForm";

interface ModeratorApplicationButtonProps {
  userId: string;
}

const ModeratorApplicationButton = ({ userId }: ModeratorApplicationButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleComplete = () => {
    setIsOpen(false);
  };

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        className="bg-blue-700 hover:bg-blue-800 text-white"
      >
        Apply as Company Moderator
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px] bg-gray-950 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Moderator Application</DialogTitle>
          </DialogHeader>
          <ModeratorApplicationForm userId={userId} onComplete={handleComplete} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ModeratorApplicationButton; 