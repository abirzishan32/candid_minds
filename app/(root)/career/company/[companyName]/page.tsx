import CompanyExperiences from "@/components/career/CompanyExperiences";

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
      <CompanyExperiences companyName={decodedCompanyName} />
    </div>
  );
} 