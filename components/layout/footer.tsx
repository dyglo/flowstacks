import Link from 'next/link';
import { Zap, Twitter, Github, Linkedin } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/30">
      <div className="container max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="p-1 bg-primary rounded">
                <Zap className="h-4 w-4 text-primary-foreground fill-primary-foreground" />
              </div>
              <span className="font-bold text-lg">FlowStacks</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Discover and compare the best AI-powered productivity tools for your workflow.
            </p>
            <div className="flex gap-3">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Explore</h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/tools"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  All Tools
                </Link>
              </li>
              <li>
                <Link
                  href="/collections"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Collections
                </Link>
              </li>
              <li>
                <Link
                  href="/discover"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Discover
                </Link>
              </li>
              <li>
                <Link
                  href="/wizard"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Stack Wizard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Categories</h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/tools?category=writing"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Writing
                </Link>
              </li>
              <li>
                <Link
                  href="/tools?category=meeting"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Meetings
                </Link>
              </li>
              <li>
                <Link
                  href="/tools?category=planning"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Planning
                </Link>
              </li>
              <li>
                <Link
                  href="/tools?category=automation"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Automation
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {currentYear} FlowStacks. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Appearance</span>
                <ThemeToggle />
              </div>
              <p className="text-xs text-muted-foreground">
                Built with care for productivity enthusiasts
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
