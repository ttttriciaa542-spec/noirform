import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpCircle, BookOpen, Mail, MessageSquare, ChevronRight, ShieldCheck, Truck, PackageCheck } from "lucide-react";

const guides = [
  { icon: BookOpen, title: "Getting started", description: "Set up your catalog, pricing, and store details in a few minutes." },
  { icon: PackageCheck, title: "Product management", description: "Add products, set stock by size, and keep your collection organized." },
  { icon: Truck, title: "Order workflow", description: "Move each order from checkout to confirmation, dispatch, and tracking." },
  { icon: ShieldCheck, title: "Security & support", description: "Keep customer records clean, review payment settings, and manage billing safely." },
];

export const Route = createFileRoute("/admin/help")({
  component: AdminHelp,
});

function AdminHelp() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="display-xl text-3xl sm:text-4xl">Help</h1>
        <p className="mt-2 text-sm text-muted-foreground">Documentation, guidance, and support for your store</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {guides.map(({ icon: Icon, title, description }) => (
          <Card key={title}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Icon className="size-4 text-muted-foreground" />
                {title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Support channels</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start">
            <BookOpen className="mr-2 size-4" /> View documentation
            <ChevronRight className="ml-auto size-4" />
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <MessageSquare className="mr-2 size-4" /> Community forum
            <ChevronRight className="ml-auto size-4" />
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Mail className="mr-2 size-4" /> Email support
            <ChevronRight className="ml-auto size-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
