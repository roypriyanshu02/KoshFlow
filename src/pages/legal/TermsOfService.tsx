import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Users, AlertCircle } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface-1/50 to-surface-2/30">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => window.history.back()} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-4xl font-black bg-gradient-primary bg-clip-text text-transparent mb-4">
            Terms of Service
          </h1>
          <p className="text-lg text-muted-foreground">
            Terms and conditions for using कोषFLOW platform
          </p>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <Card variant="gradient" className="border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-primary" />
                <CardTitle>Service Agreement</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p>
                By using कोषFLOW, you agree to these terms of service. Our platform provides financial management tools for businesses and individuals.
              </p>
            </CardContent>
          </Card>

          <Card variant="gradient" className="border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-accent" />
                <CardTitle>User Responsibilities</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <ul className="space-y-2">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Use the service in compliance with applicable laws</li>
                <li>Respect intellectual property rights</li>
              </ul>
            </CardContent>
          </Card>

          <Card variant="gradient" className="border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertCircle className="h-6 w-6 text-warning" />
                <CardTitle>Limitation of Liability</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p>
                कोषFLOW provides the service "as is" and disclaims all warranties. Our liability is limited to the maximum extent permitted by law.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
