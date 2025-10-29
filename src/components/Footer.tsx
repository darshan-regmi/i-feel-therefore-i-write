import React from "react";
import {
  FaGlobe,
  FaGithub,
  FaLinkedin,
  FaTwitter,
  FaInstagram,
} from "react-icons/fa";

const Footer: React.FC = () => {
  const socialLinks = [
    {
      href: "https://darshanregmi.com.np/",
      icon: FaGlobe,
      label: "Website",
      hoverColor: "hover:text-blue-500",
    },
    {
      href: "https://github.com/darshan-regmi",
      icon: FaGithub,
      label: "GitHub",
      hoverColor: "hover:text-gray-900",
    },
    {
      href: "https://www.linkedin.com/in/darshan-regmi-b08b7823b/",
      icon: FaLinkedin,
      label: "LinkedIn",
      hoverColor: "hover:text-blue-700",
    },
    {
      href: "https://x.com/Regmi6Darshan",
      icon: FaTwitter,
      label: "Twitter",
      hoverColor: "hover:text-sky-500",
    },
    {
      href: "https://www.instagram.com/_darshan_regmi",
      icon: FaInstagram,
      label: "Instagram",
      hoverColor: "hover:text-pink-500",
    },
  ];

  return (
    <footer className="mt-16 border-t border-gray-200 pt-8 pb-6 text-center">
      {/* Decorative line */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <div className="h-px w-12 bg-gradient-to-r from-transparent to-gray-300"></div>
        <div className="w-1 h-1 rounded-full bg-gray-400"></div>
        <div className="h-px w-12 bg-gradient-to-l from-transparent to-gray-300"></div>
      </div>

      <p className="text-sm font-light text-gray-600 mb-6">Connect with me:</p>

      {/* Social links */}
      <div className="flex justify-center items-center gap-4 mb-8">
        {socialLinks.map((link) => {
          const Icon = link.icon;
          return (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.label}
              className={`group relative p-2.5 rounded-full bg-gray-50 border border-gray-200 text-gray-600 ${link.hoverColor} hover:border-gray-300 hover:bg-white transition-all duration-300 hover:shadow-md hover:-translate-y-0.5`}
            >
              <Icon className="w-5 h-5" />
            </a>
          );
        })}
      </div>

      {/* Copyright */}
      <p className="text-xs font-light text-gray-500 italic">
        © {new Date().getFullYear()} Darshan Regmi — Made with passion & poetry
      </p>

      {/* Decorative line */}
      <div className="flex items-center justify-center gap-3 mt-8">
        <div className="h-px w-12 bg-gradient-to-r from-transparent to-gray-300"></div>
        <div className="w-1 h-1 rounded-full bg-gray-400"></div>
        <div className="h-px w-12 bg-gradient-to-l from-transparent to-gray-300"></div>
      </div>
    </footer>
  );
};

export default Footer;