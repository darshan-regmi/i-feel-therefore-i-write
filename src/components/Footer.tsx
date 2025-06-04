import React from "react";
import { FaInstagram, FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";

const Footer: React.FC = () => {
  return (
    <footer className="mt-12 border-t pt-6 text-center text-gray-600 text-sm">
      <p className="mb-2">Connect with me:</p>
      <div className="flex justify-center space-x-6 text-xl text-gray-700">
        <a
          href="https://instagram.com/wordsbydarshan"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-pink-500"
        >
          <FaInstagram />
        </a>
        <a
          href="https://github.com/yourgithub"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-900"
        >
          <FaGithub />
        </a>
        <a
          href="https://linkedin.com/in/yourlinkedin"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-blue-700"
        >
          <FaLinkedin />
        </a>
        <a
          href="https://twitter.com/yourtwitter"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-sky-500"
        >
          <FaTwitter />
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
