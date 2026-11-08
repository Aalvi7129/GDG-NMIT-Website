"use client";

import React, { useState } from "react";

const Contact = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const validatePhone = (phone: string) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPhoneError(null);
    setMessage(null);

    const form = e.currentTarget;
    const formData = {
      name: (form[0] as HTMLInputElement).value,
      email: (form[1] as HTMLInputElement).value,
      phone: (form[2] as HTMLInputElement).value,
      message: (form[3] as HTMLTextAreaElement).value,
    };

    if (!validatePhone(formData.phone)) {
      setPhoneError("Phone number must be exactly 10 digits.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setMessage("Sent successfully!");
        form.reset();
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage("Failed to send the message. Please try again.");
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="py-12 lg:py-16 bg-white dark:bg-g-almost-black relative overflow-hidden">
      <div className="relative z-10 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row w-full max-w-5xl gap-6 lg:gap-8">
          <div className="flex-1 flex flex-col justify-center w-full md:w-3/4 lg:w-full mx-auto">
            <div className="space-y-5">
              <div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
                  Contact Us
                </h2>
                <div className="h-1 w-20 bg-gradient-to-r from-g-blue via-g-red to-g-yellow rounded-full mt-4"></div>
              </div>

              <form className="space-y-4 mt-6" onSubmit={handleSubmit}>
                <div className="group">
                  <input
                    type="text"
                    placeholder="Name"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-g-gray bg-white dark:bg-black text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-g-blue focus:border-transparent transition-all duration-300"
                    required
                  />
                </div>

                <div className="group">
                  <input
                    type="email"
                    placeholder="Email"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-g-gray bg-white dark:bg-black text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-g-blue focus:border-transparent transition-all duration-300"
                    required
                  />
                </div>

                <div className="group">
                  <input
                    type="tel"
                    placeholder="Phone"
                    className={`w-full px-4 py-3 rounded-xl border ${
                      phoneError ? "border-red-500" : "border-gray-200"
                    } dark:border-g-gray bg-white dark:bg-black text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-g-blue focus:border-transparent transition-all duration-300`}
                  />
                  {phoneError && (
                    <p className="mt-1 text-red-500 font-medium">{phoneError}</p>
                  )}
                </div>

                <div className="group">
                  <textarea
                    rows={4}
                    placeholder="Message"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-g-gray bg-white dark:bg-black text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-g-blue focus:border-transparent transition-all duration-300 resize-none"
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3 cursor-pointer rounded-full bg-g-blue hover:bg-blue-600 text-white font-semibold transition-all duration-300 ease-in-out transform focus:outline-none focus:ring-2 focus:ring-g-blue focus:ring-offset-2"
                >
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </form>

              {message && (
                <p
                  className={`mt-4 text-center ${
                    message.includes("successfully") ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {message}
                </p>
              )}
            </div>
          </div>

          <div className="flex-1 relative min-h-[350px] lg:min-h-[500px] w-full md:w-3/4 lg:w-full mx-auto">
            <div className="relative w-full h-full rounded-2xl overflow-hidden border border-g-gray/30 dark:border-g-gray dark:shadow-2xl">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3885.521635379403!2d77.58508387484422!3d13.1294626872006!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae170d10bb559b%3A0x2bb3892a626cf9ba!2sNitte%20Meenakshi%20Institute%20of%20Technology!5e0!3m2!1sen!2sin!4v1760554935154!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: "400px" }}
                allowFullScreen
                loading="lazy"
                className="w-full h-full"
              ></iframe>

              <a
                href="https://maps.app.goo.gl/WW5XvcC2jwoXsjfx6"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-g-blue hover:bg-blue-600 flex items-center justify-center shadow-md transition-all duration-300 ease-in-out transform hover:scale-110 cursor-pointer group"
                aria-label="Open directions in map"
              >
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
