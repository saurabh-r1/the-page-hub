// Frontend/src/components/Freebook.jsx
import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import api from "../api/axiosInstance";
import Cards from "./Cards";
import { useNavigate } from "react-router-dom";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function Freebook() {
  const [book, setBook] = useState([]);
  const navigate = useNavigate();

  // sample fallback books (replace images later)
  const sampleBooks = [
    {
      id: "s1",
      name: "Intro to JavaScript",
      title: "Learn JS fundamentals — variables, functions, DOM and more.",
      price: 0,
      category: "Free",
      image:
        "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&q=60&auto=format&fit=crop",
    },
    // ... you can expand sampleBooks as before
  ];

  useEffect(() => {
    let mounted = true;
    const getBook = async () => {
      try {
        // use centralized api (axiosInstance) — will use VITE_API_BASE_URL or fallback
        const res = await api.get("/book", { timeout: 3000, silent: true });
        if (!mounted) return;

        const data = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
        if (Array.isArray(data) && data.length > 0) {
          const free = data.filter(
            (d) => ((d.category || d.genre || "") + "").toLowerCase() === "free"
          );
          setBook(free.length ? free : data);
        } else {
          setBook(sampleBooks);
        }
      } catch (error) {
        console.warn(
          "Could not load books from backend — using sample books.",
          error?.message
        );
        if (mounted) setBook(sampleBooks);
      }
    };
    getBook();
    return () => {
      mounted = false;
    };
  }, []); // run once

  const settings = {
    dots: true,
    infinite: book.length > 3,
    speed: 500,
    slidesToShow: Math.min(3, book.length || 3),
    slidesToScroll: Math.min(3, book.length || 3),
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Math.min(3, book.length || 3),
          slidesToScroll: 1,
          dots: true,
        },
      },
      { breakpoint: 768, settings: { slidesToShow: 2, slidesToScroll: 1 } },
      { breakpoint: 480, settings: { slidesToShow: 1, slidesToScroll: 1 } },
    ],
  };

  const handleViewBook = (item) => {
    const id = item._id || item.id || item.name;
    if (!id) return;
    navigate(`/book/${id}`, { state: { book: item } });
  };

  return (
    <section id="free" className="py-16">
      <div className="max-w-screen-2xl container mx-auto md:px-20 px-4">
        {/* Section Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white">
            Free Offered Courses
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
            Explore our collection of free learning materials designed to help
            you build strong foundations and upgrade your skills—without
            spending a penny.
          </p>
        </div>

        {book.length === 0 ? (
          <div className="text-center py-20 text-slate-600 dark:text-slate-300">
            No courses to display.
          </div>
        ) : (
          <Slider {...settings}>
            {book.map((item) => (
              <div key={item.id || item._id || item.name} className="p-3">
                <Cards item={item} onView={() => handleViewBook(item)} />
              </div>
            ))}
          </Slider>
        )}
      </div>
    </section>
  );
}
