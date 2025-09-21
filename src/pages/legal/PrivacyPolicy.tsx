import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Eye, Lock } from "lucide-react";

export default function PrivacyPolicy() {
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
            Privacy Policy
          </h1>
          <p className="text-lg text-muted-foreground">
            How कोषFLOW protects and handles your personal information
          </p>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <Card variant="gradient" className="border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-primary" />
                <CardTitle>Data Protection Commitment</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p>
                At कोषFLOW, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our financial management platform.
              </p>
            </CardContent>
          </Card>

          <Card variant="gradient" className="border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Eye className="h-6 w-6 text-accent" />
                <CardTitle>Information We Collect</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <ul className="space-y-2">
                <li><strong>Account Information:</strong> Name, email address, company details</li>
                <li><strong>Financial Data:</strong> Transaction records, invoices, payment information</li>
                <li><strong>Usage Data:</strong> How you interact with our platform</li>
                <li><strong>Technical Data:</strong> IP address, browser type, device information</li>
              </ul>
            </CardContent>
          </Card>

          <Card variant="gradient" className="border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Lock className="h-6 w-6 text-warning" />
                <CardTitle>Data Security</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p>
                We implement industry-standard security measures including 256-bit SSL encryption, secure data centers, and regular security audits to protect your information.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
