import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-200 py-8 mt-16">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center md:justify-between gap-6 md:gap-0">
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 w-full md:w-auto justify-center md:justify-start text-center md:text-left">
          <span className="text-lg font-bold text-blue-400">Fashion Park</span>
          <span className="text-sm text-gray-400">&copy; {new Date().getFullYear()} Distro Fashion Park. All rights reserved.</span>
        </div>
        <div className="flex gap-6 justify-center md:justify-end w-full md:w-auto">
          <a href="#" className="flex items-center gap-2 hover:text-blue-400 transition" aria-label="Instagram">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5A4.25 4.25 0 0 0 20.5 16.25v-8.5A4.25 4.25 0 0 0 16.25 3.5zm4.25 3.25a5.25 5.25 0 1 1 0 10.5a5.25 5.25 0 0 1 0-10.5zm0 1.5a3.75 3.75 0 1 0 0 7.5a3.75 3.75 0 0 0 0-7.5zm5.25.75a1 1 0 1 1-2 0a1 1 0 0 1 2 0z"/></svg>
            <span className="hidden sm:inline">Instagram</span>
          </a>
          <a href="#" className="flex items-center gap-2 hover:text-blue-400 transition" aria-label="Facebook">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17 2.1c-3.9 0-7 3.1-7 7v2H7v3h3v7h3v-7h2.1l.4-3H13V9c0-1.1.9-2 2-2h2V4.1c0-1.1-.9-2-2-2z"/></svg>
            <span className="hidden sm:inline">Facebook</span>
          </a>
          <a href="#" className="flex items-center gap-2 hover:text-blue-400 transition" aria-label="WhatsApp">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-8.5 15.6l-1.1 4.1a1 1 0 0 0 1.2 1.2l4.1-1.1A10 10 0 1 0 12 2zm0 18a8 8 0 1 1 0-16a8 8 0 0 1 0 16zm-2.2-6.7c.2.4.8.7 1.3.9c.5.2 1.1.2 1.5.1c.4-.1.7-.3.9-.6c.2-.3.2-.7.1-1c-.1-.3-.3-.5-.6-.7c-.2-.1-.4-.2-.6-.2c-.2 0-.4.1-.6.2c-.2.1-.3.3-.4.5c-.1.2-.1.4 0 .6c.1.2.2.3.4.4z"/></svg>
            <span className="hidden sm:inline">WhatsApp</span>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 