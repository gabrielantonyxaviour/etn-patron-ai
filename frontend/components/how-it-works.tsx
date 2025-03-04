import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  UserPlus,
  Wallet,
  FileEdit,
  UserCheck,
  ArrowRight,
} from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      id: 1,
      title: "Connect Wallet",
      description:
        "Connect your Electroneum-compatible wallet to start using ETN Patron AI",
      icon: Wallet,
      color: "bg-blue-100 text-blue-700",
    },
    {
      id: 2,
      title: "Create Profile",
      description:
        "Set up your creator profile or fan account with just a few simple steps",
      icon: UserPlus,
      color: "bg-pink-100 text-pink-700",
    },
    {
      id: 3,
      title: "Publish Content",
      description:
        "Creators can publish free or premium content with just a few clicks",
      icon: FileEdit,
      color: "bg-purple-100 text-purple-700",
    },
    {
      id: 4,
      title: "Support Creators",
      description:
        "Subscribe, purchase content, or send tips to support your favorite creators",
      icon: UserCheck,
      color: "bg-green-100 text-green-700",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {steps.map((step, index) => (
        <Card key={step.id} className="relative">
          <CardHeader>
            <div
              className={`p-3 w-12 h-12 rounded-full flex items-center justify-center ${step.color}`}
            >
              <step.icon className="h-6 w-6" />
            </div>
            <CardTitle className="mt-4">{step.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{step.description}</p>
          </CardContent>

          {index < steps.length - 1 && (
            <div className="hidden lg:block absolute top-12 -right-6 z-10">
              <div className="bg-muted-foreground/20 p-2 rounded-full">
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
