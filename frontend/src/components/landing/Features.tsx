import { Card, CardContent } from "@/components/ui/card"
import { Brain, FileText, MessageSquare, Search, Users, Award } from "lucide-react"

export function Features() {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Recommendations",
      description: "Our intelligent AI analyzes your profile and academic background to recommend scholarships that match your qualifications and interests perfectly."
    },
    {
      icon: FileText,
      title: "Smart Application System",
      description: "Streamlined multi-step application forms with auto-save functionality. Resume anytime and track your application progress effortlessly."
    },
    {
      icon: MessageSquare,
      title: "Community Forum",
      description: "Connect with fellow students, share application tips, and get advice from scholarship recipients in our active community forum."
    },
    {
      icon: Search,
      title: "Advanced Scholarship Search",
      description: "Find scholarships by category, amount, deadline, and eligibility criteria. Filter and sort results to discover the perfect opportunities."
    },
    {
      icon: Users,
      title: "Profile Management",
      description: "Create and maintain your academic profile with education history, achievements, and preferences for personalized scholarship matching."
    },
    {
      icon: Award,
      title: "Application Tracker",
      description: "Monitor all your scholarship applications in one place. Track deadlines, submission status, and receive notifications for updates."
    }
  ]

  return (
    <section className="px-8 py-16">
      <h2 className="text-4xl font-bold mb-10">Features</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {features.map((feature, idx) => (
          <Card key={idx} className="p-4 hover:shadow-lg transition-shadow">
            <CardContent className="flex flex-row items-start space-x-3">
              <feature.icon className="text-[#6b3fa0] mt-1" size={24} />
              <div className="flex flex-col space-y-2">
                <h3 className="font-semibold text-lg text-[#3d3d3d]">{feature.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
