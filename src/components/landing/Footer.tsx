import { Separator } from "@/components/ui/separator";

const Footer = () => {
  return (
    <footer className="mt-20">
      <Separator />

      <div className="py-10 px-6">
        <div className="max-w-6xl mx-auto grid gap-6 sm:grid-cols-2 items-center">

          {/* Left */}
          <div className="text-sm text-muted-foreground">
            <p>© 2026 <span className="font-medium text-foreground">GraphCareers</span>. All rights reserved.</p>
            <p className="mt-1">
              Support:{" "}
              <a
                href="mailto:support@graphcareers.com"
                className="hover:text-foreground underline underline-offset-4"
              >
                support@graphcareers.com
              </a>
            </p>
          </div>

          {/* Right */}
          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground sm:justify-end">
            <a href="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </a>
            <a href="/terms" className="hover:text-foreground transition-colors">
              Terms
            </a>
            <a href="/contact" className="hover:text-foreground transition-colors">
              Contact
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;