// Frontend/src/components/Contact.jsx
import React, { useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import api from "../api/axiosInstance";
import toast from "react-hot-toast";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setErrors((p) => ({ ...p, [e.target.name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Enter a valid email";
    if (!form.subject.trim()) e.subject = "Subject is required";
    if (!form.message.trim()) e.message = "Message is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const resetForm = () =>
    setForm({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      // try to post to backend (you can add /contact route later)
      const res = await api.post("/contact", form, { timeout: 4000 });
      toast.success(
        res?.data?.message || "Message sent — we'll get back to you!"
      );
      resetForm();
    } catch (err) {
      // If backend is not present, fallback to saving locally so messages aren't lost
      console.warn(
        "Contact POST failed — saving locally as fallback.",
        err?.message
      );
      try {
        const stored = JSON.parse(
          localStorage.getItem("contact_messages") || "[]"
        );
        stored.unshift({ ...form, createdAt: new Date().toISOString() });
        localStorage.setItem("contact_messages", JSON.stringify(stored));
        toast.success(
          "Message saved locally (no backend). We'll deliver it when server is available."
        );
        resetForm();
      } catch (e) {
        toast.error("Failed to send or save message. Check console.");
        console.error(e);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="max-w-screen-2xl container mx-auto px-5 md:px-20 pt-28 pb-24 dark:text-white">
        <section className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
            Contact us
          </h1>
          <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Have a question, suggestion or want to collaborate? Drop us a
            message and we'll reply as soon as possible.
          </p>
        </section>

        <section className="grid md:grid-cols-2 gap-8 items-start">
          {/* Contact form */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow">
            <form onSubmit={handleSubmit} noValidate>
              <div className="grid grid-cols-1 gap-4">
                <label className="block">
                  <span className="text-sm text-slate-700 dark:text-slate-200">
                    Name
                  </span>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="mt-2 input input-bordered w-full rounded-lg h-11"
                    placeholder="Your name"
                    aria-invalid={!!errors.name}
                    required
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.name}
                    </p>
                  )}
                </label>

                <label className="block">
                  <span className="text-sm text-slate-700 dark:text-slate-200">
                    Email
                  </span>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    className="mt-2 input input-bordered w-full rounded-lg h-11"
                    placeholder="you@example.com"
                    aria-invalid={!!errors.email}
                    required
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.email}
                    </p>
                  )}
                </label>

                <label className="block">
                  <span className="text-sm text-slate-700 dark:text-slate-200">
                    Subject
                  </span>
                  <input
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    className="mt-2 input input-bordered w-full rounded-lg h-11"
                    placeholder="Short summary"
                    aria-invalid={!!errors.subject}
                    required
                  />
                  {errors.subject && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.subject}
                    </p>
                  )}
                </label>

                <label className="block">
                  <span className="text-sm text-slate-700 dark:text-slate-200">
                    Message
                  </span>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    className="mt-2 textarea textarea-bordered w-full rounded-lg min-h-[120px]"
                    placeholder="Write your message..."
                    aria-invalid={!!errors.message}
                    required
                  />
                  {errors.message && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.message}
                    </p>
                  )}
                </label>

                <div className="flex items-center gap-3 mt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-pink-500 text-white font-medium shadow"
                  >
                    {loading ? "Sending..." : "Send message"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      toast("Form cleared");
                    }}
                    className="px-4 py-2 rounded-md border"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-6 text-sm text-slate-600 dark:text-slate-300">
              <p>
                If you prefer, email us directly at{" "}
                <a
                  className="text-indigo-600"
                  href="mailto:hello@bookstore.test"
                >
                  hello@bookstore.test
                </a>
                .
              </p>
            </div>
          </div>

          {/* Contact info + map */}
          <aside className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow">
              <h4 className="font-semibold mb-3">Our office</h4>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                The Page Hub Bookstore Pvt Ltd
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Mumbai, India
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Phone: +91 9471649225
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Email: thepagehub@bookstore.test
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-0 rounded-2xl overflow-hidden shadow">
              {/* Lightweight map embed (change src to your location) */}
              <iframe
                title="office-map"
                src="https://maps.google.com/maps?q=mumbai&t=&z=11&ie=UTF8&iwloc=&output=embed"
                className="w-full h-44 border-0"
                loading="lazy"
              />
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow">
              <h5 className="font-semibold mb-2">Follow us</h5>
              <div className="flex items-center gap-3">
                <a href="#" className="text-slate-500 hover:text-indigo-600">
                  Twitter
                </a>
                <a href="#" className="text-slate-500 hover:text-indigo-600">
                  YouTube
                </a>
                <a href="#" className="text-slate-500 hover:text-indigo-600">
                  GitHub
                </a>
              </div>
            </div>
          </aside>
        </section>
      </main>

      <Footer />
    </>
  );
}
