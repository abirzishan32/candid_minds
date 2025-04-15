import CompanyExperiences from "@/components/career/CompanyExperiences";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

interface CompanyPageProps {
  params: {
    companyName: string;
  };
}

export async function generateMetadata({ params }: CompanyPageProps) {
  const { companyName } = params;
  const decodedCompanyName = decodeURIComponent(companyName);
  
  return {
    title: `${decodedCompanyName} Interview Experiences | Candid Minds`,
    description: `Read anonymous interview experiences from ${decodedCompanyName}. Learn about the interview process, questions, and preparation tips.`
  };
}

export default function CompanyPage({ params }: CompanyPageProps) {
  const { companyName } = params;
  const decodedCompanyName = decodeURIComponent(companyName);
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center mb-4">
        <Link href="/career" className="text-blue-500 hover:text-blue-600">
          
          <Button variant="outline" className="text-blue-500 hover:text-blue-600">
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back
          </Button>
        </Link>
      </div>
      <CompanyExperiences companyName={decodedCompanyName} />
    </div>
  );
} 