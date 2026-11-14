import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "";
axios.defaults.baseURL = API_URL;

function App() {
  const [pizzas, setPizzas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [ingredients, setIngredients] = useState([]);
  const [ingredientsError, setIngredientsError] = useState("");

  const [selectedPizza, setSelectedPizza] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedBase, setSelectedBase] = useState("");
  const [selectedSauce, setSelectedSauce] = useState("");
  const [selectedCheese, setSelectedCheese] = useState("");
  const [selectedVegetables, setSelectedVegetables] = useState([]);
  const [quantity, setQuantity] = useState(1);

  const [cartItems, setCartItems] = useState([]);
  const [showCart, setShowCart] = useState(false);

  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [createdOrder, setCreatedOrder] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [paymentResult, setPaymentResult] = useState(null);

  const [checkoutForm, setCheckoutForm] = useState({
    phone: "",
    deliveryAddress: "",
  });

  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [myOrders, setMyOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [showOrders, setShowOrders] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [allOrders, setAllOrders] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState("");

  const [authToken, setAuthToken] = useState(
    () => localStorage.getItem("token") || ""
  );

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });

  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
  });

  const [adminTab, setAdminTab] = useState("orders");

  const [inventoryItems, setInventoryItems] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [inventoryError, setInventoryError] = useState("");
  const [inventoryForm, setInventoryForm] = useState({
    name: "",
    category: "base",
    quantity: "",
    unit: "pieces",
    lowStockThreshold: 20,
  });
  const [inventoryFormLoading, setInventoryFormLoading] = useState(false);

  const [pizzaForm, setPizzaForm] = useState({
    name: "",
    description: "",
    category: "classic",
    image: "",
    smallPrice: "",
    mediumPrice: "",
    largePrice: "",
    ingredients: "",
    isFeatured: false,
  });

  const [editingPizzaId, setEditingPizzaId] = useState(null);
  const [pizzaFormError, setPizzaFormError] = useState("");
  const [pizzaFormLoading, setPizzaFormLoading] = useState(false);

  // Fetch pizzas
  useEffect(() => {
    const fetchPizzas = async () => {
      try {
        const response = await axios.get(
          "/api/pizzas"
        );

        const data = response.data.pizzas || response.data.data || [];
        setPizzas(data.filter((pizza) => pizza.isAvailable));
      } catch (err) {
        console.error("Failed to fetch pizzas:", err);
        setError("Unable to load the menu. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchPizzas();
  }, []);

  // Fetch available ingredients
  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const response = await axios.get(
          "/api/inventory/available-ingredients"
        );

        setIngredients(response.data.ingredients || []);
      } catch (err) {
        console.error("Failed to fetch ingredients:", err);
        setIngredientsError("Unable to load customization options.");
      }
    };

    fetchIngredients();
  }, []);

  // Fetch the logged-in user's orders
  const fetchMyOrders = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setOrdersError("Please login to view your orders.");
      return;
    }

    try {
      setOrdersLoading(true);
      setOrdersError("");

      const response = await axios.get(
        "/api/orders/my-orders",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMyOrders(response.data.orders || []);
    } catch (err) {
      setOrdersError(
        err.response?.data?.message || "Unable to load your orders."
      );
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchAllOrders = async () => {
    const token = localStorage.getItem("token");

    try {
      setAdminLoading(true);
      setAdminError("");

      const response = await axios.get(
        "/api/orders",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAllOrders(response.data.orders || []);
    } catch (err) {
      setAdminError(
        err.response?.data?.message || "Unable to load orders."
      );
    } finally {
      setAdminLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    const token = localStorage.getItem("token");

    try {
      setAdminError("");

      await axios.patch(
        `/api/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await fetchAllOrders();
    } catch (err) {
      setAdminError(
        err.response?.data?.message || "Unable to update order status."
      );
    }
  };

  // Automatically refresh orders every 5 seconds while viewing them
  useEffect(() => {
    if (!showOrders || !currentUser) return;

    fetchMyOrders();

    const interval = setInterval(() => {
      fetchMyOrders();
    }, 5000);

    return () => clearInterval(interval);
  }, [showOrders, currentUser]);

  useEffect(() => {
    if (!showAdmin || currentUser?.role !== "admin") return;

    fetchAllOrders();

    const interval = setInterval(() => {
      fetchAllOrders();
    }, 5000);

    return () => clearInterval(interval);
  }, [showAdmin, currentUser]);

  // Open customization modal
  const openCustomization = (pizza) => {
    setSelectedPizza(pizza);

    setSelectedSize(
      pizza.sizes?.find((size) => size.name === "medium")?.name ||
        pizza.sizes?.[0]?.name ||
        ""
    );

    setSelectedBase("");
    setSelectedSauce("");
    setSelectedCheese("");
    setSelectedVegetables([]);
    setQuantity(1);
    setIngredientsError("");
  };

  // Close customization modal
  const closeCustomization = () => {
    setSelectedPizza(null);
  };

  // Select or remove vegetables
  const toggleVegetable = (vegetable) => {
    setSelectedVegetables((current) =>
      current.includes(vegetable)
        ? current.filter((item) => item !== vegetable)
        : [...current, vegetable]
    );
  };

  // Add pizza to cart
  const addToCart = () => {
    if (
      !selectedPizza ||
      !selectedSize ||
      !selectedBase ||
      !selectedSauce ||
      !selectedCheese
    ) {
      setIngredientsError("Please complete all required selections.");
      return;
    }

    const size = selectedPizza.sizes.find(
      (item) => item.name === selectedSize
    );

    if (!size) return;

    const cartItem = {
      cartItemId: crypto.randomUUID(),
      pizzaId: selectedPizza._id,
      pizzaName: selectedPizza.name,
      size: selectedSize,
      unitPrice: size.price,
      quantity,
      customizations: {
        base: selectedBase,
        sauce: selectedSauce,
        cheese: selectedCheese,
        vegetables: selectedVegetables,
      },
    };

    setCartItems((current) => [...current, cartItem]);
    closeCustomization();
  };

  // Update cart item quantity
  const updateCartQuantity = (cartItemId, change) => {
    setCartItems((current) =>
      current.map((item) =>
        item.cartItemId === cartItemId
          ? {
              ...item,
              quantity: Math.max(1, item.quantity + change),
            }
          : item
      )
    );
  };

  // Remove item from cart
  const removeFromCart = (cartItemId) => {
    setCartItems((current) =>
      current.filter((item) => item.cartItemId !== cartItemId)
    );
  };

  const handleCheckout = async (event) => {
    event.preventDefault();

    if (!cartItems.length) {
      setCheckoutError("Your cart is empty.");
      return;
    }

    setCheckoutLoading(true);
    setCheckoutError("");

    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        "/api/orders",
        {
          items: cartItems.map((item) => ({
            pizzaId: item.pizzaId,
            size: item.size,
            quantity: item.quantity,
            customizations: item.customizations,
          })),
          deliveryAddress: checkoutForm.deliveryAddress,
          phone: checkoutForm.phone,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCreatedOrder(response.data.order);
      setShowCheckout(false);
      setShowCart(false);
    } catch (err) {
      setCheckoutError(
        err.response?.data?.message ||
          "Unable to create your order. Please try again."
      );
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleStartPayment = async () => {
    setPaymentLoading(true);
    setPaymentError("");

    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        "/api/payments/start",
        { orderId: createdOrder._id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPaymentData(response.data.payment);
    } catch (err) {
      setPaymentError(
        err.response?.data?.message || "Unable to start payment."
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleCompleteMockPayment = async (result) => {
    setPaymentLoading(true);
    setPaymentError("");

    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        "/api/payments/mock/complete",
        {
          orderId: createdOrder._id,
          paymentId: paymentData.paymentId,
          result,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCreatedOrder(response.data.order);
      setPaymentData(null);

      if (result === "success") {
        setCartItems([]);
        setPaymentResult("success");
      } else {
        setPaymentResult("failure");
      }
    } catch (err) {
      setPaymentError(
        err.response?.data?.message || "Payment could not be processed."
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  // Calculate cart total
  const cartTotal = cartItems.reduce(
    (total, item) => total + item.unitPrice * item.quantity,
    0
  );

  const handleAuthSubmit = async (event) => {
  event.preventDefault();

  setAuthError("");
  setAuthSuccess("");
  setAuthLoading(true);

  try {
    if (authMode === "register") {
      const response = await axios.post(
        "/api/auth/register",
        authForm
      );

      setAuthSuccess(
        response.data.message ||
        "Registration successful. Please verify your email."
      );

      setAuthMode("login");
      setAuthForm({
        name: "",
        email: authForm.email,
        password: "",
        phone: "",
        address: "",
      });
    } else {
      const response = await axios.post(
        "/api/auth/login",
        {
          email: authForm.email,
          password: authForm.password,
        }
      );

      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setAuthToken(token);
      setCurrentUser(user);
      setShowAuth(false);

      setAuthForm({
        name: "",
        email: "",
        password: "",
        phone: "",
        address: "",
      });
    }
  } catch (err) {
    setAuthError(
      err.response?.data?.message ||
      "Something went wrong. Please try again."
    );
  } finally {
    setAuthLoading(false);
  }
};

const resetPizzaForm = () => {
  setPizzaForm({
    name: "",
    description: "",
    category: "classic",
    image: "",
    smallPrice: "",
    mediumPrice: "",
    largePrice: "",
    ingredients: "",
    isFeatured: false,
  });

  setEditingPizzaId(null);
  setPizzaFormError("");
};

const handlePizzaSubmit = async (event) => {
  event.preventDefault();

  setPizzaFormError("");
  setPizzaFormLoading(true);

  try {
    const token = localStorage.getItem("token");

    const pizzaData = {
      name: pizzaForm.name.trim(),
      description: pizzaForm.description.trim(),
      category: pizzaForm.category,
      image: pizzaForm.image.trim(),
      sizes: [
        { name: "small", price: Number(pizzaForm.smallPrice) },
        { name: "medium", price: Number(pizzaForm.mediumPrice) },
        { name: "large", price: Number(pizzaForm.largePrice) },
      ],
      ingredients: pizzaForm.ingredients
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      isAvailable: true,
      isFeatured: pizzaForm.isFeatured,
    };

    const url = editingPizzaId
      ? `/api/pizzas/${editingPizzaId}`
      : "/api/pizzas";

    await axios({
      method: editingPizzaId ? "put" : "post",
      url,
      data: pizzaData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const response = await axios.get(
      "/api/pizzas"
    );

    const updatedPizzas =
      response.data.pizzas || response.data.data || [];

    setPizzas(updatedPizzas.filter((pizza) => pizza.isAvailable));

    resetPizzaForm();
  } catch (err) {
    setPizzaFormError(
      err.response?.data?.message || "Unable to save pizza."
    );
  } finally {
    setPizzaFormLoading(false);
  }
};

const handleEditPizza = (pizza) => {
  setEditingPizzaId(pizza._id);

  setPizzaForm({
    name: pizza.name || "",
    description: pizza.description || "",
    category: pizza.category || "classic",
    image: pizza.image || "",
    smallPrice: pizza.sizes?.find((size) => size.name === "small")?.price ?? "",
    mediumPrice: pizza.sizes?.find((size) => size.name === "medium")?.price ?? "",
    largePrice: pizza.sizes?.find((size) => size.name === "large")?.price ?? "",
    ingredients: (pizza.ingredients || []).join(", "),
    isFeatured: pizza.isFeatured || false,
  });

  setPizzaFormError("");
};

const handleDeletePizza = async (pizzaId) => {
  if (!window.confirm("Are you sure you want to delete this pizza?")) {
    return;
  }

  try {
    const token = localStorage.getItem("token");

    await axios.delete(
      `/api/pizzas/${pizzaId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setPizzas((current) =>
      current.filter((pizza) => pizza._id !== pizzaId)
    );
  } catch (err) {
    alert(err.response?.data?.message || "Unable to delete pizza.");
  }
};

// Inventory Management
const fetchInventory = async () => {
  try {
    setInventoryLoading(true);
    setInventoryError("");

    const token = localStorage.getItem("token");

    const response = await axios.get(
      "/api/inventory",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setInventoryItems(response.data.items || []);
  } catch (err) {
    setInventoryError(
      err.response?.data?.message || "Unable to load inventory."
    );
  } finally {
    setInventoryLoading(false);
  }
};

const handleInventorySubmit = async (event) => {
  event.preventDefault();
  setInventoryError("");
  setInventoryFormLoading(true);

  try {
    const token = localStorage.getItem("token");

    await axios.post(
      "/api/inventory",
      {
        ...inventoryForm,
        quantity: Number(inventoryForm.quantity),
        lowStockThreshold: Number(inventoryForm.lowStockThreshold),
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setInventoryForm({
      name: "",
      category: "base",
      quantity: "",
      unit: "pieces",
      lowStockThreshold: 20,
    });

    await fetchInventory();
  } catch (err) {
    setInventoryError(
      err.response?.data?.message || "Unable to add inventory item."
    );
  } finally {
    setInventoryFormLoading(false);
  }
};

const handleInventoryQuantity = async (itemId, currentQuantity) => {
  const newQuantity = window.prompt(
    "Enter the new stock quantity:",
    currentQuantity
  );

  if (newQuantity === null || newQuantity.trim() === "") return;

  const quantity = Number(newQuantity);

  if (!Number.isFinite(quantity) || quantity < 0) {
    setInventoryError("Please enter a valid quantity.");
    return;
  }

  try {
    setInventoryError("");

    const token = localStorage.getItem("token");

    await axios.patch(
      `/api/inventory/${itemId}`,
      { quantity },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    await fetchInventory();
  } catch (err) {
    setInventoryError(
      err.response?.data?.message || "Unable to update stock."
    );
  }
};

  return (
    <div className="app">
      <header className="navbar">
  <a href="#" className="logo" onClick={() => setMobileMenuOpen(false)}>
    <span className="logo-icon">🍕</span>
    <span>
      Oasis<span className="logo-highlight">Pizza</span>
    </span>
  </a>

  <button
    className="mobile-menu-toggle"
    onClick={() => setMobileMenuOpen((prev) => !prev)}
    aria-label="Toggle navigation menu"
    aria-expanded={mobileMenuOpen}
  >
    {mobileMenuOpen ? "✕" : "☰"}
  </button>

  <div className={`mobile-menu ${mobileMenuOpen ? "mobile-menu-open" : ""}`}>
    <nav className="nav-links">
      <a href="#" onClick={() => setMobileMenuOpen(false)}>Home</a>
      <a href="#menu" onClick={() => setMobileMenuOpen(false)}>Our Menu</a>
      <a href="#about" onClick={() => setMobileMenuOpen(false)}>About Us</a>
      <a href="#contact" onClick={() => setMobileMenuOpen(false)}>Contact</a>
    </nav>

    <div className="nav-actions">
      {currentUser ? (
        <>
          <button
            className="login-link"
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              setAuthToken("");
              setCurrentUser(null);
              setMobileMenuOpen(false);
            }}
          >
            Logout
          </button>

          <button
            className="orders-button"
            onClick={() => {
              setShowOrders(true);
              setMobileMenuOpen(false);
            }}
          >
            My Orders
          </button>

          {currentUser?.role === "admin" && (
            <button
              className="orders-button"
              onClick={() => {
                setShowAdmin(true);
                setMobileMenuOpen(false);
              }}
            >
              Admin Dashboard
            </button>
          )}
        </>
      ) : (
        <button
          className="login-link"
          onClick={() => {
            setAuthMode("login");
            setAuthError("");
            setAuthSuccess("");
            setShowAuth(true);
            setMobileMenuOpen(false);
          }}
        >
          Login
        </button>
      )}

      <button
        className="cart-button"
        onClick={() => {
          setShowCart(true);
          setMobileMenuOpen(false);
        }}
      >
        🛒 Cart
        <span>
          {cartItems.reduce(
            (total, item) => total + item.quantity,
            0
          )}
        </span>
      </button>
    </div>
  </div>
</header>

      {showAuth && (
  <div
    className="modal-overlay"
    onClick={() => setShowAuth(false)}
  >
    <div
      className="customization-modal auth-modal"
      onClick={(event) => event.stopPropagation()}
    >
      <button
        className="modal-close"
        onClick={() => setShowAuth(false)}
      >
        ×
      </button>

      <span className="eyebrow">WELCOME TO OASIS PIZZA</span>

      <h2>
        {authMode === "login" ? "Welcome Back!" : "Create Account"}
      </h2>

      <p>
        {authMode === "login"
          ? "Login to continue your delicious journey."
          : "Join us and enjoy your favorite pizzas."}
      </p>

      {authError && <p className="form-error">{authError}</p>}
      {authSuccess && <p className="auth-success">{authSuccess}</p>}

      <form onSubmit={handleAuthSubmit}>
        {authMode === "register" && (
          <>
            <div className="customization-field">
              <label>Full Name</label>
              <input
                type="text"
                required
                value={authForm.name}
                onChange={(e) =>
                  setAuthForm({ ...authForm, name: e.target.value })
                }
                placeholder="Your name"
              />
            </div>

            <div className="customization-field">
              <label>Phone</label>
              <input
                type="tel"
                required
                value={authForm.phone}
                onChange={(e) =>
                  setAuthForm({ ...authForm, phone: e.target.value })
                }
                placeholder="Your phone number"
              />
            </div>

            <div className="customization-field">
              <label>Delivery Address</label>
              <input
                type="text"
                required
                value={authForm.address}
                onChange={(e) =>
                  setAuthForm({ ...authForm, address: e.target.value })
                }
                placeholder="Your address"
              />
            </div>
          </>
        )}

        <div className="customization-field">
          <label>Email</label>
          <input
            type="email"
            required
            value={authForm.email}
            onChange={(e) =>
              setAuthForm({ ...authForm, email: e.target.value })
            }
            placeholder="example@email.com"
          />
        </div>

        <div className="customization-field">
          <label>Password</label>
          <input
            type="password"
            required
            minLength={8}
            value={authForm.password}
            onChange={(e) =>
              setAuthForm({ ...authForm, password: e.target.value })
            }
            placeholder="Enter your password"
          />
        </div>

        <button
          type="submit"
          className="primary-button auth-submit"
          disabled={authLoading}
        >
          {authLoading
            ? "Please wait..."
            : authMode === "login"
              ? "Login"
              : "Create Account"}
        </button>
      </form>

      <p className="auth-switch">
        {authMode === "login"
          ? "Don't have an account?"
          : "Already have an account?"}

        <button
          type="button"
          onClick={() => {
            setAuthMode(authMode === "login" ? "register" : "login");
            setAuthError("");
            setAuthSuccess("");
          }}
        >
          {authMode === "login" ? "Register" : "Login"}
        </button>
      </p>
    </div>
  </div>
)}

      <main>
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-content">
            <span className="eyebrow">FRESH FROM OUR OVEN</span>

            <h1>
              A Slice Of
              <br />
              <span>Happiness</span>
              <br />
              In Every Bite.
            </h1>

            <p>
              Delicious pizzas, fresh ingredients, and unforgettable
              flavors. Your favorite pizza is just a click away.
            </p>

            <div className="hero-actions">
              <a href="#menu" className="primary-button">
                Explore Menu <span>→</span>
              </a>

              <a href="#about" className="secondary-button">
                Discover More
              </a>
            </div>

            <div className="hero-stats">
  <div>
    <strong>{pizzas.length}</strong>
    <span>Pizzas Available</span>
  </div>

  <div>
    <strong>3 Sizes</strong>
    <span>Choose Your Size</span>
  </div>

  <div>
    <strong>Custom</strong>
    <span>Made Your Way</span>
  </div>
</div>
          </div>

          <div className="hero-visual">
            <div className="pizza-circle">
  <img
    src="/images/pepperoni.png"
    alt="Fresh Pepperoni Pizza"
    className="hero-pizza-photo"
  />
</div>

            <div className="floating-card">
              <span>🔥</span>
              <div>
                <strong>Fresh & Hot</strong>
                <small>Made with love</small>
              </div>
            </div>

            <div className="floating-label">100% Delicious</div>
          </div>
        </section>

        {/* Menu Section */}
        <section className="menu-section" id="menu">
          <div className="section-heading">
            <div>
              <span className="eyebrow">OUR SPECIALTIES</span>
              <h2>
                Popular <span>Pizzas</span>
              </h2>
              <p>Made fresh. Served hot. Loved by everyone.</p>
            </div>

            <a href="#menu" className="view-all">
              View All →
            </a>
          </div>

          {loading ? (
            <p>Loading our delicious pizzas...</p>
          ) : error ? (
            <p>{error}</p>
          ) : pizzas.length === 0 ? (
            <p>No pizzas available right now.</p>
          ) : (
            <div className="pizza-grid">
              {pizzas.map((pizza) => {
                const defaultSize =
                  pizza.sizes?.find((size) => size.name === "medium") ||
                  pizza.sizes?.[0];

                return (
                  <article className="pizza-card" key={pizza._id}>
                    <div className="pizza-image">
                      <span className="pizza-tag">
                        {pizza.isFeatured ? "Best Seller" : pizza.category}
                      </span>

                      {pizza.image ? (
                        <img
                          src={pizza.image}
                          alt={pizza.name}
                          className="pizza-photo"
                        />
                      ) : (
                        <span className="pizza-emoji">🍕</span>
                      )}
                    </div>

                    <div className="pizza-info">
                      <span className="pizza-category">
                        {pizza.category}
                      </span>

                      <h3>{pizza.name}</h3>
                      <p>{pizza.description}</p>

                      <div className="pizza-footer">
                        <strong>
                          {defaultSize
                            ? `${defaultSize.price} ₹`
                            : "Price unavailable"}
                        </strong>

                        <button
                          disabled={!defaultSize}
                          onClick={() => openCustomization(pizza)}
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Customization Modal */}
        {selectedPizza && (
          <div
            className="modal-overlay"
            onClick={closeCustomization}
          >
            <div
              className="customization-modal"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                className="modal-close"
                onClick={closeCustomization}
              >
                ×
              </button>

              <span className="eyebrow">MAKE IT YOURS</span>
              <h2>{selectedPizza.name}</h2>
              <p>{selectedPizza.description}</p>

              {(ingredientsError || "") && (
                <p className="form-error">{ingredientsError}</p>
              )}

              <div className="customization-field">
                <label>Choose Size</label>

                <select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                >
                  {selectedPizza.sizes.map((size) => (
                    <option
                      key={size._id || size.name}
                      value={size.name}
                    >
                      {size.name} - {size.price} ₹
                    </option>
                  ))}
                </select>
              </div>

              {["base", "sauce", "cheese"].map((category) => {
                const options = ingredients.filter(
                  (item) => item.category === category
                );

                const values = {
                  base: selectedBase,
                  sauce: selectedSauce,
                  cheese: selectedCheese,
                };

                const setters = {
                  base: setSelectedBase,
                  sauce: setSelectedSauce,
                  cheese: setSelectedCheese,
                };

                return (
                  <div
                    className="customization-field"
                    key={category}
                  >
                    <label>
                      Choose{" "}
                      {category.charAt(0).toUpperCase() +
                        category.slice(1)}
                    </label>

                    <select
                      value={values[category]}
                      onChange={(e) =>
                        setters[category](e.target.value)
                      }
                    >
                      <option value="">Select {category}</option>

                      {options.map((item) => (
                        <option key={item.name} value={item.name}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}

              <div className="customization-field">
                <label>Choose Vegetables</label>

                <div className="vegetable-options">
                  {ingredients
                    .filter((item) => item.category === "vegetable")
                    .map((item) => (
                      <label
                        className="vegetable-option"
                        key={item.name}
                      >
                        <input
                          type="checkbox"
                          checked={selectedVegetables.includes(item.name)}
                          onChange={() => toggleVegetable(item.name)}
                        />
                        {item.name}
                      </label>
                    ))}
                </div>
              </div>

              <div className="customization-field">
                <label>Quantity</label>

                <div className="quantity-control">
                  <button
                    onClick={() =>
                      setQuantity((q) => Math.max(1, q - 1))
                    }
                  >
                    −
                  </button>

                  <strong>{quantity}</strong>

                  <button onClick={() => setQuantity((q) => q + 1)}>
                    +
                  </button>
                </div>
              </div>

              <div className="modal-footer">
                <strong>
                  {(selectedPizza.sizes.find(
                    (size) => size.name === selectedSize
                  )?.price || 0) * quantity}{" "}
                  ₹
                </strong>

                <button
                  className="primary-button"
                  onClick={addToCart}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        )}

        {/* About Section */}
<section className="about-section" id="about">
  <div className="about-content">
    <span className="eyebrow">WHY OASIS PIZZA?</span>
    <h2>
      Good Food. <span>Good Mood.</span>
    </h2>
    <p>
      Your pizza, your way. Choose your favorite size,
      customize your ingredients, and enjoy a delicious
      ordering experience from start to finish.
    </p>
  </div>

  <div className="about-features">
    <div className="about-feature">
      <span>🍕</span>
      <h3>Your Perfect Pizza</h3>
      <p>Choose your favorite pizza and the size you love.</p>
    </div>

    <div className="about-feature">
      <span>🧀</span>
      <h3>Made Your Way</h3>
      <p>Customize your base, sauce, cheese, and vegetables.</p>
    </div>

    <div className="about-feature">
      <span>📦</span>
      <h3>Track Your Order</h3>
      <p>Follow your order status from preparation to delivery.</p>
    </div>
  </div>
</section>
      </main>

      {/* Shopping Cart */}
      {showCart && (
        <div
          className="cart-overlay"
          onClick={() => setShowCart(false)}
        >
          <div
            className="cart-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="cart-header">
              <div>
                <span className="eyebrow">YOUR ORDER</span>
                <h2>Shopping Cart</h2>
              </div>

              <button
                className="modal-close"
                onClick={() => setShowCart(false)}
              >
                ×
              </button>
            </div>

            {cartItems.length === 0 ? (
              <div className="empty-cart">
                <span>🛒</span>
                <h3>Your cart is empty</h3>
                <p>Add some delicious pizzas to get started.</p>

                <button
                  className="primary-button"
                  onClick={() => setShowCart(false)}
                >
                  Explore Menu
                </button>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cartItems.map((item) => (
                    <article
                      className="cart-item"
                      key={item.cartItemId}
                    >
                      <div className="cart-item-image">🍕</div>

                      <div className="cart-item-details">
                        <h3>{item.pizzaName}</h3>

                        <p>Size: {item.size}</p>
                        <p>Base: {item.customizations.base}</p>
                        <p>Sauce: {item.customizations.sauce}</p>
                        <p>Cheese: {item.customizations.cheese}</p>

                        {item.customizations.vegetables.length > 0 && (
                          <p>
                            Vegetables:{" "}
                            {item.customizations.vegetables.join(", ")}
                          </p>
                        )}

                        <strong>
                          {item.unitPrice * item.quantity} ₹
                        </strong>

                        <div className="cart-item-actions">
                          <div className="quantity-control">
                            <button
                              onClick={() =>
                                updateCartQuantity(item.cartItemId, -1)
                              }
                            >
                              −
                            </button>

                            <strong>{item.quantity}</strong>

                            <button
                              onClick={() =>
                                updateCartQuantity(item.cartItemId, 1)
                              }
                            >
                              +
                            </button>
                          </div>

                          <button
                            className="remove-item"
                            onClick={() =>
                              removeFromCart(item.cartItemId)
                            }
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="cart-summary">
                  <div className="cart-total">
                    <span>Total</span>
                    <strong>{cartTotal} ₹</strong>
                  </div>

                  <button
                    className="primary-button checkout-button"
                    onClick={() => {
                      setCheckoutError("");
                      setCheckoutForm({
                        phone: currentUser?.phone || "",
                        deliveryAddress: currentUser?.address || "",
                      });
                      setShowCart(false);
                      setShowCheckout(true);
                    }}
                  >
                    Proceed to Checkout →
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

            {showCheckout && (
        <div
          className="modal-overlay"
          onClick={() => setShowCheckout(false)}
        >
          <div
            className="customization-modal auth-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setShowCheckout(false)}
            >
              ×
            </button>

            <span className="eyebrow">FINAL STEP</span>
            <h2>Delivery Details</h2>
            <p>Where should we deliver your delicious pizza?</p>

            {checkoutError && (
              <p className="form-error">{checkoutError}</p>
            )}

            <form onSubmit={handleCheckout}>
              <div className="customization-field">
                <label>Phone Number</label>
                <input
                  type="tel"
                  required
                  value={checkoutForm.phone}
                  onChange={(e) =>
                    setCheckoutForm({
                      ...checkoutForm,
                      phone: e.target.value,
                    })
                  }
                  placeholder="Your phone number"
                />
              </div>

              <div className="customization-field">
                <label>Delivery Address</label>
                <textarea
                  required
                  rows="3"
                  value={checkoutForm.deliveryAddress}
                  onChange={(e) =>
                    setCheckoutForm({
                      ...checkoutForm,
                      deliveryAddress: e.target.value,
                    })
                  }
                  placeholder="Enter your full delivery address"
                />
              </div>

              <div className="cart-total">
                <span>Order Total</span>
                <strong>{cartTotal} ₹</strong>
              </div>

              <button
                type="submit"
                className="primary-button auth-submit"
                disabled={checkoutLoading}
              >
                {checkoutLoading
                  ? "Creating Order..."
                  : "Confirm Order"}
              </button>
            </form>
          </div>
        </div>
      )}

      {createdOrder && (
        <div className="modal-overlay">
          <div className="customization-modal auth-modal">
            <span className="eyebrow">
              {paymentResult === "success"
                ? "PAYMENT CONFIRMED"
                : paymentResult === "failure"
                  ? "PAYMENT FAILED"
                  : paymentData
                    ? "SECURE CHECKOUT"
                    : "ORDER CREATED"}
            </span>

            <h2>
              {paymentResult === "success"
                ? "Payment Successful!"
                : paymentResult === "failure"
                  ? "Payment Failed"
                  : paymentData
                    ? "Complete Your Payment"
                    : "Order Received!"}
            </h2>

            <p>
              {paymentResult === "success"
                ? "Your order is confirmed and being prepared."
                : paymentResult === "failure"
                  ? "Your payment was not completed. Your order is still unpaid."
                  : paymentData
                    ? "Choose a result to simulate your payment."
                    : "Your order has been created successfully."}
            </p>

            <div className="cart-total">
              <span>Order Total</span>
              <strong>{createdOrder.totalAmount} ₹</strong>
            </div>

            <p>Order ID: {createdOrder._id}</p>

            {paymentError && (
              <p className="form-error">{paymentError}</p>
            )}

            {!paymentData &&
              !paymentResult &&
              createdOrder.paymentStatus !== "Paid" && (
                <button
                  className="primary-button auth-submit"
                  onClick={handleStartPayment}
                  disabled={paymentLoading}
                >
                  {paymentLoading ? "Please wait..." : "Pay Now"}
                </button>
              )}

            {paymentData && !paymentResult && (
              <div className="payment-actions">
                <p>Mock Payment ID: {paymentData.paymentId}</p>

                <button
                  className="primary-button auth-submit"
                  onClick={() => handleCompleteMockPayment("success")}
                  disabled={paymentLoading}
                >
                  {paymentLoading
                    ? "Processing..."
                    : "Simulate Successful Payment"}
                </button>

                <button
                  className="payment-failure-button"
                  onClick={() => handleCompleteMockPayment("failure")}
                  disabled={paymentLoading}
                >
                  Simulate Failed Payment
                </button>
              </div>
            )}

            {(paymentResult || createdOrder.paymentStatus === "Paid") && (
              <button
                className="primary-button auth-submit"
                onClick={() => {
                  setCreatedOrder(null);
                  setPaymentResult(null);
                  setPaymentError("");
                }}
              >
                Continue
              </button>
            )}

            {paymentResult === "failure" && (
              <button
                className="payment-failure-button"
                onClick={() => {
                  setCreatedOrder(null);
                  setPaymentResult(null);
                  setPaymentError("");
                }}
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}

      {showOrders && (
        <div
          className="orders-overlay"
          onClick={() => setShowOrders(false)}
        >
          <div
            className="orders-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="orders-header">
              <div>
                <span className="eyebrow">YOUR ORDERS</span>
                <h2>Order History</h2>
              </div>

              <button
                className="modal-close"
                onClick={() => setShowOrders(false)}
              >
                ×
              </button>
            </div>

            {ordersLoading && myOrders.length === 0 ? (
              <p className="orders-message">Loading your orders...</p>
            ) : ordersError ? (
              <p className="form-error">{ordersError}</p>
            ) : myOrders.length === 0 ? (
              <div className="empty-cart">
                <span>🍕</span>
                <h3>No orders yet</h3>
                <p>Your orders will appear here.</p>
              </div>
            ) : (
              <div className="orders-list">
                {myOrders.map((order) => {
                  const statuses = [
                    "Order Received",
                    "In Kitchen",
                    "Sent to Delivery",
                  ];

                  const currentStatusIndex = statuses.indexOf(order.status);

                  return (
                    <article className="order-card" key={order._id}>
                      <div className="order-card-header">
                        <div>
                          <span className="order-id">
                            Order #{order._id.slice(-8)}
                          </span>
                          <p>
                            {new Date(order.createdAt).toLocaleString()}
                          </p>
                        </div>

                        <span className="order-status">
                          {order.status}
                        </span>
                      </div>

                      <div className="order-items-list">
                        {order.items?.map((item, index) => (
                          <div
                            className="order-product"
                            key={`${order._id}-${index}`}
                          >
                            <span>
                              {item.quantity} × {item.pizzaName || item.name}
                            </span>
                            <span>
                              {item.unitPrice * item.quantity} ₹
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="order-progress">
                        {statuses.map((status, index) => (
                          <div
                            className={`progress-step ${
                              index <= currentStatusIndex ? "completed" : ""
                            }`}
                            key={status}
                          >
                            <span className="progress-dot">
                              {index < currentStatusIndex ? "✓" : index + 1}
                            </span>
                            <span>{status}</span>
                          </div>
                        ))}
                      </div>

                      <div className="order-card-footer">
                        <span>
                          Payment: {order.paymentStatus}
                        </span>
                        <strong>{order.totalAmount} ₹</strong>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

            {showAdmin && currentUser?.role === "admin" && (
        <div
          className="orders-overlay"
          onClick={() => setShowAdmin(false)}
        >
          <div
            className="orders-modal admin-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="orders-header">
              <div>
                <span className="eyebrow">OASIS PIZZA</span>
                <h2>Admin Dashboard</h2>
                <p>Manage customer orders</p>
              </div>

              <button
                className="modal-close"
                onClick={() => setShowAdmin(false)}
              >
                ×
              </button>
            </div>

            <div className="admin-tabs">
              <button
                className={adminTab === "orders" ? "active" : ""}
                onClick={() => setAdminTab("orders")}
              >
                Orders
              </button>

              <button
                className={adminTab === "pizzas" ? "active" : ""}
                onClick={() => setAdminTab("pizzas")}
              >
                Pizza Management
              </button>

              <button
                className={adminTab === "inventory" ? "active" : ""}
                onClick={() => {
                  setAdminTab("inventory");
                  fetchInventory();
                }}
              >
                Inventory
              </button>
            </div>

            {adminTab === "orders" && (
              <>
                <div className="admin-summary">
                  <div>
                    <strong>{allOrders.length}</strong>
                    <span>Total Orders</span>
                  </div>

                  <div>
                    <strong>
                      {allOrders.filter(
                        (order) => order.status === "Order Received"
                      ).length}
                    </strong>
                    <span>New Orders</span>
                  </div>

                  <div>
                    <strong>
                      {allOrders.filter(
                        (order) => order.status === "In Kitchen"
                      ).length}
                    </strong>
                    <span>In Kitchen</span>
                  </div>
                </div>

                {adminLoading && allOrders.length === 0 ? (
                  <p className="orders-message">Loading orders...</p>
                ) : adminError ? (
                  <p className="form-error">{adminError}</p>
                ) : allOrders.length === 0 ? (
                  <div className="empty-cart">
                    <span>📦</span>
                    <h3>No orders found</h3>
                  </div>
                ) : (
                  <div className="orders-list">
                    {allOrders.map((order) => {
                      const nextStatus = {
                        "Order Received": "In Kitchen",
                        "In Kitchen": "Sent to Delivery",
                      };

                      return (
                        <article className="order-card" key={order._id}>
                          <div className="order-card-header">
                            <div>
                              <span className="order-id">
                                Order #{order._id.slice(-8)}
                              </span>
                              <p>
                                {new Date(order.createdAt).toLocaleString()}
                              </p>
                            </div>

                            <span className="order-status">
                              {order.status}
                            </span>
                          </div>

                          <div className="admin-order-details">
                            <p>
                              <strong>Customer:</strong>{" "}
                              {order.user?.name || "Customer"}
                            </p>

                            <p>
                              <strong>Phone:</strong>{" "}
                              {order.phone || "Not available"}
                            </p>

                            <p>
                              <strong>Address:</strong>{" "}
                              {order.deliveryAddress || "Not available"}
                            </p>

                            <p>
                              <strong>Payment:</strong>{" "}
                              {order.paymentStatus}
                            </p>
                          </div>

                          <div className="order-items-list">
                            {order.items?.map((item, index) => (
                              <div
                                className="order-product"
                                key={`${order._id}-${index}`}
                              >
                                <span>
                                  {item.quantity} × {item.pizzaName || item.name}
                                  {" "}({item.size})
                                </span>

                                <span>
                                  {item.unitPrice * item.quantity} ₹
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="order-card-footer">
                            <strong>{order.totalAmount} ₹</strong>

                            {nextStatus[order.status] ? (
                              <button
                                className="primary-button admin-status-button"
                                onClick={() =>
                                  handleUpdateOrderStatus(
                                    order._id,
                                    nextStatus[order.status]
                                  )
                                }
                              >
                                Move to {nextStatus[order.status]} →
                              </button>
                            ) : (
                              <span className="order-status">
                                Order Completed
                              </span>
                            )}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {adminTab === "pizzas" && (
              <div className="pizza-management">
                <div className="pizza-management-header">
                  <div>
                    <h3>Manage Pizzas</h3>
                    <p>Add, edit and remove pizzas from your menu.</p>
                  </div>
                </div>

                <form
                  className="pizza-admin-form"
                  onSubmit={handlePizzaSubmit}
                >
                  <h3>
                    {editingPizzaId ? "Edit Pizza" : "Add New Pizza"}
                  </h3>

                  <div className="customization-field">
                    <label>Pizza Name</label>
                    <input
                      value={pizzaForm.name}
                      onChange={(e) =>
                        setPizzaForm({
                          ...pizzaForm,
                          name: e.target.value,
                        })
                      }
                      placeholder="e.g. Chicken BBQ"
                      required
                    />
                  </div>

                  <div className="customization-field">
                    <label>Description</label>
                    <textarea
                      value={pizzaForm.description}
                      onChange={(e) =>
                        setPizzaForm({
                          ...pizzaForm,
                          description: e.target.value,
                        })
                      }
                      placeholder="Describe your pizza..."
                      required
                    />
                  </div>

                  <div className="customization-field">
                    <label>Category</label>
                    <select
                      value={pizzaForm.category}
                      onChange={(e) =>
                        setPizzaForm({
                          ...pizzaForm,
                          category: e.target.value,
                        })
                      }
                    >
                      <option value="classic">Classic</option>
                      <option value="vegetarian">Vegetarian</option>
                      <option value="special">Special</option>
                    </select>
                  </div>

                  <div className="customization-field">
                    <label>Image URL</label>
                    <input
                      value={pizzaForm.image}
                      onChange={(e) =>
                        setPizzaForm({
                          ...pizzaForm,
                          image: e.target.value,
                        })
                      }
                      placeholder="https://example.com/pizza.jpg"
                    />
                  </div>

                  <label>Pizza Prices (₹)</label>

                  <div className="pizza-price-fields">
                    <input
                      type="number"
                      min="1"
                      placeholder="Small"
                      value={pizzaForm.smallPrice}
                      onChange={(e) =>
                        setPizzaForm({
                          ...pizzaForm,
                          smallPrice: e.target.value,
                        })
                      }
                      required
                    />

                    <input
                      type="number"
                      min="1"
                      placeholder="Medium"
                      value={pizzaForm.mediumPrice}
                      onChange={(e) =>
                        setPizzaForm({
                          ...pizzaForm,
                          mediumPrice: e.target.value,
                        })
                      }
                      required
                    />

                    <input
                      type="number"
                      min="1"
                      placeholder="Large"
                      value={pizzaForm.largePrice}
                      onChange={(e) =>
                        setPizzaForm({
                          ...pizzaForm,
                          largePrice: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="customization-field">
                    <label>Ingredients (separated by commas)</label>
                    <input
                      value={pizzaForm.ingredients}
                      onChange={(e) =>
                        setPizzaForm({
                          ...pizzaForm,
                          ingredients: e.target.value,
                        })
                      }
                      placeholder="Chicken, Mozzarella, BBQ Sauce"
                    />
                  </div>

                  <label className="featured-checkbox">
                    <input
                      type="checkbox"
                      checked={pizzaForm.isFeatured}
                      onChange={(e) =>
                        setPizzaForm({
                          ...pizzaForm,
                          isFeatured: e.target.checked,
                        })
                      }
                    />
                    Featured Pizza
                  </label>

                  {pizzaFormError && (
                    <p className="form-error">{pizzaFormError}</p>
                  )}

                  <div className="pizza-form-actions">
                    <button
                      type="submit"
                      className="primary-button"
                      disabled={pizzaFormLoading}
                    >
                      {pizzaFormLoading
                        ? "Saving..."
                        : editingPizzaId
                          ? "Update Pizza"
                          : "Add Pizza"}
                    </button>

                    {editingPizzaId && (
                      <button
                        type="button"
                        onClick={resetPizzaForm}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>

                <div className="admin-pizza-list">
                  <h3>Current Menu ({pizzas.length})</h3>

                  {pizzas.length === 0 ? (
                    <p>No pizzas available.</p>
                  ) : (
                    pizzas.map((pizza) => (
                      <article
                        className="admin-pizza-card"
                        key={pizza._id}
                      >
                        <div>
                          <h4>{pizza.name}</h4>
                          <p>{pizza.category}</p>

                          <span>
                            {pizza.sizes?.map((size) =>
                              `${size.name}: ${size.price} ₹`
                            ).join(" | ")}
                          </span>
                        </div>

                        <div className="admin-pizza-actions">
                          <button
                            type="button"
                            onClick={() => handleEditPizza(pizza)}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeletePizza(pizza._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </div>
            )}

                        {adminTab === "inventory" && (
              <div className="inventory-management">
                <div className="pizza-management-header">
                  <h3>Inventory Management</h3>
                  <p>Monitor and manage your ingredients stock.</p>
                </div>

                {inventoryError && (
                  <p className="form-error">{inventoryError}</p>
                )}

                <form
                  className="pizza-admin-form"
                  onSubmit={handleInventorySubmit}
                >
                  <h3>Add Inventory Item</h3>

                  <div className="customization-field">
                    <label>Ingredient Name</label>
                    <input
                      value={inventoryForm.name}
                      onChange={(e) =>
                        setInventoryForm({
                          ...inventoryForm,
                          name: e.target.value,
                        })
                      }
                      placeholder="e.g. Mozzarella"
                      required
                    />
                  </div>

                  <div className="customization-field">
                    <label>Category</label>
                    <select
                      value={inventoryForm.category}
                      onChange={(e) =>
                        setInventoryForm({
                          ...inventoryForm,
                          category: e.target.value,
                        })
                      }
                    >
                      <option value="base">Base</option>
                      <option value="sauce">Sauce</option>
                      <option value="cheese">Cheese</option>
                      <option value="vegetable">Vegetable</option>
                    </select>
                  </div>

                  <div className="pizza-price-fields">
                    <div className="customization-field">
                      <label>Quantity</label>
                      <input
                        type="number"
                        min="0"
                        value={inventoryForm.quantity}
                        onChange={(e) =>
                          setInventoryForm({
                            ...inventoryForm,
                            quantity: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="customization-field">
                      <label>Unit</label>
                      <input
                        value={inventoryForm.unit}
                        onChange={(e) =>
                          setInventoryForm({
                            ...inventoryForm,
                            unit: e.target.value,
                          })
                        }
                        placeholder="pieces / kg"
                        required
                      />
                    </div>

                    <div className="customization-field">
                      <label>Low Stock Alert</label>
                      <input
                        type="number"
                        min="0"
                        value={inventoryForm.lowStockThreshold}
                        onChange={(e) =>
                          setInventoryForm({
                            ...inventoryForm,
                            lowStockThreshold: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="primary-button"
                    disabled={inventoryFormLoading}
                  >
                    {inventoryFormLoading
                      ? "Adding..."
                      : "Add Ingredient"}
                  </button>
                </form>

                <div className="admin-pizza-list">
                  <div className="inventory-list-header">
                    <h3>Current Stock ({inventoryItems.length})</h3>

                    <button
                      type="button"
                      onClick={fetchInventory}
                    >
                      Refresh
                    </button>
                  </div>

                  {inventoryLoading ? (
                    <p>Loading inventory...</p>
                  ) : inventoryItems.length === 0 ? (
                    <p>No inventory items found.</p>
                  ) : (
                    inventoryItems.map((item) => (
                      <article
                        className="admin-pizza-card"
                        key={item._id}
                      >
                        <div>
                          <h4>{item.name}</h4>
                          <p>{item.category} · {item.unit}</p>
                          <strong>
                            {item.quantity} {item.unit}
                          </strong>
                          <p>
                            Alert threshold: {item.lowStockThreshold}
                          </p>

                          {item.quantity <= item.lowStockThreshold && (
                            <span className="inventory-low-stock">
                              Low Stock
                            </span>
                          )}
                        </div>

                        <div className="admin-pizza-actions">
                          <button
                            type="button"
                            onClick={() =>
                              handleInventoryQuantity(
                                item._id,
                                item.quantity
                              )
                            }
                          >
                            Update Stock
                          </button>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <footer id="contact">
  <div className="footer-brand">
    <a href="#" className="logo">
      🍕 Oasis<span className="logo-highlight">Pizza</span>
    </a>
    <p>Freshly made. Simply delicious.</p>
  </div>

  <div className="footer-links">
    <a href="#">Home</a>
    <a href="#menu">Our Menu</a>
    <a href="#about">About Us</a>
  </div>

  <div className="footer-bottom">
    <p>Made with ❤️ for pizza lovers.</p>
    <span>© 2026 Oasis Pizza. All rights reserved.</span>
  </div>
</footer>
    </div>
  );
}

export default App;