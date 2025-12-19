// Frontend/src/components/Cart.jsx
import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useCart } from "../context/CartProvider";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import api from "../api/axiosInstance";
import toast from "react-hot-toast";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&q=60&auto=format&fit=crop";

// 🔑 Razorpay key from Vite env
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

// helper: load Razorpay script once
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export default function Cart() {
  const {
    items,
    updateQty,
    removeFromCart,
    clearCart,
    totalItems,
    totalPrice,
  } = useCart();
  const [authUser] = useAuth();
  const isAdmin = authUser?.role === "admin";
  const navigate = useNavigate();
  const location = useLocation();

  // --------- Existing demo checkout (no Razorpay) ----------
  const handleCheckout = async () => {
    if (!items.length) {
      toast("Your cart is empty.");
      return;
    }

    if (!authUser) {
      toast("Please log in to checkout.", { icon: "🔒" });
      navigate("/login", { state: { from: location } });
      return;
    }

    try {
      const payload = {
        items: items.map((it) => ({
          bookId: it.bookId,
          qty: it.qty,
          book: {
            _id: it.book?._id,
            price: it.book?.price,
          },
        })),
        total: totalPrice,
      };

      await api.post("/orders", payload);

      toast.success(
        `Order placed : ${totalItems} item(s), total ₹${totalPrice.toFixed(2)}`,
        { icon: "✅" }
      );

      clearCart();
      navigate("/orders");
    } catch (err) {
      console.error("Checkout / order error:", err?.message);
      const msg =
        err?.response?.data?.message ||
        "Failed to place order. Please try again.";
      toast.error(msg);
    }
  };

  // --------- NEW: Razorpay checkout ----------
  const handleRazorpayPay = async () => {
    if (!items.length) {
      toast("Your cart is empty.");
      return;
    }

    if (!authUser) {
      toast("Please log in to pay.", { icon: "🔒" });
      navigate("/login", { state: { from: location } });
      return;
    }

    if (!RAZORPAY_KEY_ID) {
      toast.error("Razorpay key is not configured in frontend env.");
      return;
    }

    const ok = await loadRazorpayScript();
    if (!ok) {
      toast.error("Failed to load Razorpay. Please check your internet.");
      return;
    }

    try {
      // 1) Ask backend to create Razorpay order
      const createPayload = {
        amount: Math.round(totalPrice * 100), // Razorpay uses paise
        items: items.map((it) => ({
          bookId: it.bookId,
          qty: it.qty,
        })),
      };

      const res = await api.post("/payments/razorpay/create-order", createPayload);
      const { razorpayOrderId, amount, currency, orderId } = res.data;

      // 2) Open Razorpay checkout
      const options = {
        key: RAZORPAY_KEY_ID,
        amount,
        currency,
        name: "The Page Hub",
        description: "Book purchase",
        order_id: razorpayOrderId,
        prefill: {
          name: authUser.fullname,
          email: authUser.email,
        },
        theme: {
          color: "#4f46e5",
        },
        handler: async function (response) {
          try {
            // 3) Verify payment with backend
            await api.post("/payments/razorpay/verify", {
              orderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            toast.success("Payment successful! Order confirmed.", {
              icon: "🎉",
            });
            clearCart();
            navigate("/orders");
          } catch (err) {
            console.error("Payment verify error:", err?.message);
            toast.error(
              err?.response?.data?.message ||
                "Payment captured but verification failed."
            );
          }
        },
        modal: {
          ondismiss: function () {
            toast("Payment popup closed.", { icon: "ℹ️" });
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Razorpay create order error:", err?.message);
      const msg =
        err?.response?.data?.message ||
        "Unable to initiate payment. Please try again.";
      toast.error(msg);
    }
  };

  // ------------------ UI ------------------
  return (
    <>
      <Navbar />

      <main className="max-w-screen-2xl container mx-auto px-5 md:px-20 pt-24 pb-16 dark:text-white">
        <h1 className="text-2xl md:text-3xl font-extrabold mb-4">Your cart</h1>

        {/* ADMIN – no cart */}
        {isAdmin ? (
          <div className="mt-10 text-center text-slate-600 dark:text-slate-300">
            <p>Cart is not available for admin accounts.</p>
            <button
              onClick={() => navigate("/course")}
              className="mt-4 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm"
            >
              Go to Books
            </button>
          </div>
        ) : !items.length ? (
          // EMPTY CART
          <div className="mt-10 text-center text-slate-600 dark:text-slate-300">
            <p>Your cart is empty.</p>
            <button
              onClick={() => navigate("/course")}
              className="mt-4 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm"
            >
              Browse books
            </button>
          </div>
        ) : (
          // CART WITH ITEMS
          <div className="grid lg:grid-cols-3 gap-8 mt-6">
            {/* Items list */}
            <section className="lg:col-span-2 space-y-4">
              {items.map((item) => {
                const book = item.book || {};
                const id = item.bookId;
                const price = Number(book.price || 0);
                const lineTotal = price * item.qty;

                return (
                  <div
                    key={id}
                    className="flex gap-4 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                  >
                    <div className="w-20 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-slate-50 dark:bg-slate-800">
                      <img
                        src={book.image || FALLBACK_IMAGE}
                        alt={book.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = FALLBACK_IMAGE;
                        }}
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h2 className="text-sm md:text-base font-semibold line-clamp-2">
                          {book.name}
                        </h2>
                        {book.author && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            by {book.author}
                          </p>
                        )}
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                          {book.title}
                        </p>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                        {/* Quantity control */}
                        <div className="inline-flex items-center border rounded-full overflow-hidden bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                          <button
                            type="button"
                            onClick={() =>
                              updateQty(id, Math.max(1, item.qty - 1))
                            }
                            className="px-3 py-1 text-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                          >
                            -
                          </button>
                          <span className="px-4 py-1 text-sm font-medium">
                            {item.qty}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateQty(id, Math.min(10, item.qty + 1))
                            }
                            className="px-3 py-1 text-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                          >
                            +
                          </button>
                        </div>

                        {/* Price / total */}
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              Price
                            </div>
                            <div className="text-sm font-semibold">
                              {price === 0 ? "Free" : `₹${price}`}
                            </div>
                          </div>

                          {price > 0 && (
                            <div className="text-right">
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                Total
                              </div>
                              <div className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                                ₹{lineTotal}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Remove */}
                    <button
                      type="button"
                      onClick={() => removeFromCart(id)}
                      className="self-start text-xs text-red-500 hover:text-red-600"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </section>

            {/* Summary panel */}
            <aside className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 h-fit">
              <h2 className="text-lg font-semibold mb-3">Order summary</h2>

              <div className="flex justify-between text-sm mb-1">
                <span>Items</span>
                <span>{totalItems}</span>
              </div>

              <div className="flex justify-between text-sm mb-3">
                <span>Subtotal</span>
                <span>
                  {totalPrice === 0 ? "Free" : `₹${totalPrice.toFixed(2)}`}
                </span>
              </div>

              {/* NEW: Razorpay button */}
              {totalPrice > 0 && (
                <button
                  type="button"
                  onClick={handleRazorpayPay}
                  className="w-full mt-2 py-2.5 rounded-lg bg-black text-white text-sm font-semibold hover:bg-slate-900"
                >
                  Pay with Razorpay
                </button>
              )}

              {/* Existing demo checkout */}
              <button
                type="button"
                onClick={handleCheckout}
                className="w-full mt-3 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700"
              >
                Place order
              </button>

              <button
                type="button"
                onClick={clearCart}
                className="w-full mt-3 py-2 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                Clear cart
              </button>
            </aside>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
