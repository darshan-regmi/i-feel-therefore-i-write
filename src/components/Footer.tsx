import React from "react";
import { FaGlobe, FaGithub, FaLinkedin, FaTwitter, FaInstagram } from "react-icons/fa";

const Footer: React.FC = () => {
  return (
    <footer className="mt-12 border-t pt-6 text-center text-gray-600 text-sm">
      <p className="mb-2">Connect with me:</p>
      <div className="flex justify-center space-x-6 text-xl text-gray-700">
        <a
          href="https://darshanregmi.com.np/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-blue-500"
        >
          <FaGlobe />
        </a>
        <a
          href="https://github.com/darshan-regmi"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-900"
        >
          <FaGithub />
        </a>
        <a
          href="https://www.linkedin.com/in/darshan-regmi-b08b7823b/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-blue-700"
        >
          <FaLinkedin />
        </a>
        <a
          href="https://x.com/Regmi6Darshan"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-sky-500"
        >
          <FaTwitter />
        </a>
        <a
          href="https://www.instagram.com/_darshan_regmi"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-pink-500"
          aria-label="Instagram"
        >
          <FaInstagram />
        </a>
      </div>
      <p className="mt-4 text-xs text-gray-400">
        © {new Date().getFullYear()} Darshan Regmi — Made with passion & poetry
      </p>{" "}
      <br />
    </footer>
  );
};

export default Footer;
