import React, { useEffect, useMemo, useState } from "react";
import "./App.css";

/********************
 * LocalStorage Helpers
 ********************/
const LS = {
  usersKey: "users",
  productsKey: "products",
  ordersKey: "orders",
  sessionKey: "sessionUser",
  cartKey: (u) => `cart_${u}`,

  getUsers: () => JSON.parse(localStorage.getItem("users") || "[]"),
  setUsers: (v) => localStorage.setItem("users", JSON.stringify(v)),

  getProducts: () => JSON.parse(localStorage.getItem("products") || "[]"),
  setProducts: (v) => localStorage.setItem("products", JSON.stringify(v)),

  getOrders: () => JSON.parse(localStorage.getItem("orders") || "[]"),
  setOrders: (v) => localStorage.setItem("orders", JSON.stringify(v)),

  getSession: () => JSON.parse(localStorage.getItem("sessionUser") || "null"),
  setSession: (u) => localStorage.setItem("sessionUser", JSON.stringify(u)),
  clearSession: () => localStorage.removeItem("sessionUser"),

  getCart: (u) => JSON.parse(localStorage.getItem(`cart_${u}`) || "[]"),
  setCart: (u, v) => localStorage.setItem(`cart_${u}`, JSON.stringify(v)),
};

/********************
 * Seed demo data (first load)
 ********************/
function seed() {
  if (LS.getProducts().length === 0) {
    LS.setProducts([
      {
        id: 1,
        name: "Laptop Pro 14",
        price: 1200,
        category: "electronics",
        image: "https://via.placeholder.com/600x400?text=Laptop+Pro+14",
        description: "Powerful 14\" laptop for creators.",
      },
      {
        id: 2,
        name: "Smartphone X",
        price: 699,
        category: "electronics",
        image: "https://via.placeholder.com/600x400?text=Smartphone+X",
        description: "Edge-to-edge OLED display with great camera.",
      },
      {
        id: 3,
        name: "Noise-cancel Headphones",
        price: 199,
        category: "accessories",
        image: "https://via.placeholder.com/600x400?text=Headphones",
        description: "Over-ear ANC headphones for focus.",
      },
      {
        id: 4,
        name: "Gaming Mouse",
        price: 59,
        category: "accessories",
        image: "https://via.placeholder.com/600x400?text=Gaming+Mouse",
        description: "RGB ergonomic mouse with 8k sensor.",
      },
    ]);
  }
  if (LS.getUsers().length === 0) {
    LS.setUsers([{ username: "admin", password: "admin123", role: "admin" }]);
  }
}

/********************
 * Utility: CSV export
 ********************/
function downloadCSV(filename, rows) {
  const processRow = (row) =>
    row
      .map((val) => {
        if (val == null) return "";
        const inner = String(val).replace(/"/g, '""');
        return `"${inner}"`;
      })
      .join(",");
  const csv =
    [rows[0].join(",")].concat(rows.slice(1).map(processRow)).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

/********************
 * UI: Navbar
 ********************/
function Navbar({ user, go, counts }) {
  return (
    <div className="nav">
      <div className="nav__brand">R.L Mart</div>
      {user?.role === "user" && (
        <div className="nav__actions">
          <button onClick={() => go("user.dashboard")}>Products</button>
          <button onClick={() => go("user.orders")}>My Orders</button>
          <button onClick={() => go("user.cart")}>
            Cart {counts?.cart ? <span className="badge">{counts.cart}</span> : null}
          </button>
          <button onClick={() => go("logout")} className="btn-danger">Logout</button>
        </div>
      )}
      {user?.role === "admin" && (
        <div className="nav__actions">
          <button onClick={() => go("admin.dashboard")}>Dashboard</button>
          <button onClick={() => go("admin.addProduct")}>Add Product</button>
          <button onClick={() => go("admin.viewOrders")}>View Orders</button>
          <button onClick={() => go("admin.viewCustomers")}>View Customers</button>
          <button onClick={() => go("logout")} className="btn-danger">Logout</button>
        </div>
      )}
    </div>
  );
}

/********************
 * Auth: Login & Signup
 ********************/
function Login({ onLogin, onSwitchToSignup }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [asAdmin, setAsAdmin] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    const users = LS.getUsers();
    const foundUser = users.find(
      (u) => u.username === username && u.password === password
    );
    if (foundUser) {
      if (asAdmin && foundUser.role !== "admin") {
        setError("This account is not an admin.");
        return;
      }
      LS.setSession(foundUser);
      onLogin(foundUser);
    } else {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="center">
      <div className="card w-400">
        <h2>Login</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleLogin} className="vstack gap-8">
          <input
            className="input"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            className="input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <label className="checkbox">
            <input
              type="checkbox"
              checked={asAdmin}
              onChange={(e) => setAsAdmin(e.target.checked)}
            />
            <span>Login as Admin</span>
          </label>
          <button type="submit" className="btn-primary">Login</button>
        </form>
        <p className="muted mt-12">
          Don’t have an account?{" "}
          <button className="link" onClick={onSwitchToSignup}>
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
}

function Signup({ onSwitchToLogin }) {
  // 🟢 अब role भी state में रखा
  const [form, setForm] = useState({ username: "", password: "", role: "user" });
  const [error, setError] = useState("");

  const handleSignup = (e) => {
    e.preventDefault();
    const users = LS.getUsers();
    const exists = users.find((u) => u.username === form.username);
    if (exists) {
      setError("User already exists");
      return;
    }
    // 🟢 Role अब form.role से आएगा
    const newUser = { username: form.username, password: form.password, role: form.role };
    LS.setUsers([...users, newUser]);
    alert(`Signup successful as ${form.role.toUpperCase()}! Please login.`);
    onSwitchToLogin();
  };

  return (
    <div className="center">
      <div className="card w-400">
        <h2>Sign Up</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSignup} className="vstack gap-8">
          <input
            className="input"
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
          <input
            className="input"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          {/* 🟢 नया Dropdown for role */}
          <label className="label">Signup as:</label>
          <select
            className="input"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>

          <button type="submit" className="btn-success">Create Account</button>
        </form>
        <p className="muted mt-12">
          Already have an account?{" "}
          <button className="link" onClick={onSwitchToLogin}>
            Login
          </button>
        </p>
      </div>
    </div>
  );
}
/********************
 * USER PAGES
 ********************/
function ProductsGrid({ go, products }) {
  return (
    <div className="grid">
      {products.map((p) => (
        <div key={p.id} className="card card--product">
          <img
            src={p.image || "https://via.placeholder.com/300x200?text=No+Image"}
            alt={p.name}
            className="product__img"
          />
          <div className="product__name">{p.name}</div>
          <div className="product__price">${p.price}</div>
          <p className="product__desc">{p.description}</p>
          <div className="hstack gap-8 mt-12">
            <button onClick={() => go("user.product", { id: p.id })} className="btn-dark">
              View
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function UserDashboard({ user, go, cartCount }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("default");
  const products = LS.getProducts();

  const categories = Array.from(new Set(products.map((p) => p.category))).filter(Boolean);

  const filtered = products
    .filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sort === "price_asc") return a.price - b.price;
      if (sort === "price_desc") return b.price - a.price;
      return 0;
    });

  return (
    <div>
      <Navbar user={user} go={go} counts={{ cart: cartCount }} />
      <div className="page">
        <div className="toolbar">
          <h1>Products</h1>
          <div className="hstack gap-8">
            <input
              placeholder="Search products..."
              className="input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select className="input" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="default">Sort</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
            </select>
          </div>
        </div>
        <ProductsGrid go={go} products={filtered} />
      </div>
    </div>
  );
}

function ProductPage({ user, go, productId }) {
  const products = LS.getProducts();
  const product = products.find((p) => String(p.id) === String(productId));
  const [qty, setQty] = useState(1);

  const addToCart = () => {
    const cart = LS.getCart(user.username);
    const existing = cart.find((c) => c.productId === product.id);
    if (existing) existing.qty += qty;
    else cart.push({ productId: product.id, qty });
    LS.setCart(user.username, cart);
    alert("✅ Added to cart");
    go("user.cart");
  };

  if (!product)
    return (
      <div>
        <Navbar user={user} go={go} />
        <div className="page">Product not found.</div>
      </div>
    );

  return (
    <div>
      <Navbar user={user} go={go} />
      <div className="page grid-2">
        <div className="card">
          <img
            src={product.image || "https://via.placeholder.com/600x400?text=No+Image"}
            alt={product.name}
            className="product__img--lg"
          />
          <h2 className="mt-12">{product.name}</h2>
          <div className="muted mt-8">${product.price}</div>
          <p className="mt-12">{product.description}</p>
        </div>
        <div className="card h-fit">
          <label className="label">Quantity</label>
          <input
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(parseInt(e.target.value || 1, 10))}
            className="input w-120"
          />
          <div className="hstack gap-8 mt-12">
            <button onClick={addToCart} className="btn-primary">
              Add to Cart
            </button>
            <button onClick={() => go("user.dashboard")} className="btn">
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CartPage({ user, go }) {
  const [cart, setCart] = useState(LS.getCart(user.username));
  const products = LS.getProducts();

  const removeItem = (pid) => {
    const next = cart.filter((c) => c.productId !== pid);
    setCart(next);
    LS.setCart(user.username, next);
  };

  const total = cart.reduce((sum, c) => {
    const p = products.find((pp) => pp.id === c.productId);
    return sum + (p?.price || 0) * c.qty;
  }, 0);

  return (
    <div>
      <Navbar user={user} go={go} counts={{ cart: cart.length }} />
      <div className="page">
        <h1>Your Cart</h1>
        {cart.length === 0 ? (
          <p className="muted mt-12">Your cart is empty.</p>
        ) : (
          <div className="vstack gap-12">
            {cart.map((c) => {
              const p = products.find((pp) => pp.id === c.productId);
              return (
                <div key={c.productId} className="card hstack between">
                  <div className="hstack gap-12">
                    <img
                      src={p?.image || "https://via.placeholder.com/80x60?text=No"}
                      alt={p?.name}
                      className="thumb"
                    />
                    <div>
                      <div className="bold">{p?.name}</div>
                      <div className="muted small">Qty: {c.qty} × ${p?.price}</div>
                    </div>
                  </div>
                  <div className="vstack end">
                    <div className="bold">${((p?.price || 0) * c.qty).toFixed(2)}</div>
                    <button className="link-danger mt-8" onClick={() => removeItem(c.productId)}>
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
            <div className="right bold">Total: ${typeof total === "number" ? total.toFixed(2) : "0.00"}</div>
            <div className="right hstack gap-8">
              <button className="btn" onClick={() => go("user.dashboard")}>
                Continue Shopping
              </button>
              <button className="btn-success" onClick={() => go("user.payment")}>
                Proceed to Payment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PaymentPage({ user, go }) {
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  const placeOrder = () => {
    const cart = LS.getCart(user.username);
    if (cart.length === 0) return alert("Cart is empty");
    const products = LS.getProducts();
    const items = cart.map((c) => {
      const p = products.find((pp) => pp.id === c.productId);
      return { productId: c.productId, qty: c.qty, priceAtPurchase: p?.price || 0 };
    });
    const total = items.reduce((s, i) => s + i.qty * i.priceAtPurchase, 0);
    const order = {
      id: Date.now(),
      user: user.username,
      address,
      phone,
      status: "Placed",
      createdAt: new Date().toISOString(),
      items,
      total,
      paymentMethod: "Cash on Delivery",
    };
    const orders = LS.getOrders();
    LS.setOrders([order, ...orders]);
    LS.setCart(user.username, []);
    alert("✅ Order has been placed! Cash on delivery.");
    go("user.orders");
  };

  return (
    <div>
      <Navbar user={user} go={go} />
      <div className="page">
        <div className="card w-600 mx-auto">
          <h1>Payment</h1>
          <div className="vstack gap-12 mt-12">
            <div>
              <label className="label">Delivery Address</label>
              <textarea
                className="input"
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Phone</label>
              <input
                className="input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="note">Payment Method: <b>Cash on Delivery</b></div>
            <div className="right hstack gap-8">
              <button className="btn" onClick={() => go("user.cart")}>Back to Cart</button>
              <button className="btn-primary" onClick={placeOrder}>Place Order</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrdersPage({ user, go }) {
  const orders = LS.getOrders().filter((o) => o.user === user.username);
  return (
    <div>
      <Navbar user={user} go={go} />
      <div className="page">
        <h1>My Orders</h1>
        {orders.length === 0 ? (
          <p className="muted mt-12">No orders yet.</p>
        ) : (
          <div className="vstack gap-12">
            {orders.map((o) => (
              <div key={o.id} className="card">
                <div className="hstack between">
                  <div>
                    <div className="bold">Order #{o.id}</div>
                    <div className="muted small">{new Date(o.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="chip">{o.status}</div>
                </div>
                <div className="muted mt-8 small">Address: {o.address}</div>
                <div className="muted mt-4 small">Phone: {o.phone}</div>
                <ul className="list mt-12">
                  {o.items.map((it, idx) => {
                    const p = LS.getProducts().find((pp) => pp.id === it.productId);
                    return (
                      <li key={idx}>
                        {p?.name} — Qty {it.qty} × ${it.priceAtPurchase}
                      </li>
                    );
                  })}
                </ul>
                <div className="right bold mt-12">Total: ${o.total ? o.total.toFixed(2) : "0.00"}
              </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/********************
 * ADMIN PAGES
 ********************/
function AdminDashboard({ user, go }) {
  const orders = LS.getOrders();
  const users = LS.getUsers().filter((u) => u.role === "user");
  const products = LS.getProducts();

  // Order counts & revenue
  const counts = useMemo(() => {
    const delivered = orders.filter((o) => o.status === "Delivered").length;
    const cancelled = orders.filter((o) => o.status === "Cancelled").length;
    const placed = orders.filter((o) => o.status === "Placed").length;
    const revenue = orders
      .filter((o) => o.status !== "Cancelled")
      .reduce((s, o) => s + (o.total || 0), 0);
    return {
      delivered,
      cancelled,
      placed,
      revenue,
      users: users.length,
      orders: orders.length,
    };
  }, [orders, users.length]);

  // Product stats
  const productStats = useMemo(() => {
    let totalProducts = products.length;

    // Category wise count
    let categories = {};
    products.forEach((p) => {
      categories[p.category] = (categories[p.category] || 0) + 1;
    });

    // Sales per product (delivered orders only)
    let sales = {};
    orders
      .filter((o) => o.status === "Delivered")
      .forEach((o) => {
        o.items.forEach((it) => {
          sales[it.productId] = (sales[it.productId] || 0) + it.qty;
        });
      });

    return { totalProducts, categories, sales };
  }, [products, orders]);

  // Delete product function
  const deleteProduct = (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    const updated = products.filter((p) => p.id !== id);
    LS.setProducts(updated);
    alert("Product deleted successfully");
    window.location.reload(); // force refresh (or you can manage via state if needed)
  };

  return (
    <div>
      <Navbar user={user} go={go} />
      <div className="page">
        <h1>Admin Dashboard</h1>

        {/* Stats overview */}
        <div className="grid-4 mt-12">
          <div className="stat">Revenue <b>${counts.revenue.toFixed(2)}</b></div>
          <div className="stat">New Orders <b>{counts.placed}</b></div>
          <div className="stat">Delivered <b>{counts.delivered}</b></div>
          <div className="stat">Cancelled <b>{counts.cancelled}</b></div>
        </div>

        {/* Quick Actions + Recent Orders */}
        <div className="grid-3 mt-16">
          <div className="card">
            <div className="bold mb-8">Quick Actions</div>
            <div className="vstack gap-8">
              <button className="btn-dark" onClick={() => go("admin.addProduct")}>Add Product</button>
              <button className="btn" onClick={() => go("admin.viewOrders")}>View Orders</button>
              <button className="btn" onClick={() => go("admin.viewCustomers")}>View Customers</button>
            </div>
          </div>

          <div className="card col-span-2">
            <div className="bold mb-8">Recent Orders</div>
            {orders.slice(0, 5).length === 0 ? (
              <div className="muted small">No orders yet.</div>
            ) : (
              <ul className="vstack gap-8">
                {orders.slice(0, 5).map((o) => (
                  <li key={o.id} className="row between">
                    <span>
                      #{o.id} • {o.user} • $
                      {typeof o.total === "number" ? o.total.toFixed(2) : "0.00"}
                    </span>
                    <span className="chip">{o.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Product Analytics */}
        <div className="grid-2 mt-16">
          <div className="card">
            <div className="bold mb-8">Products Overview</div>
            <p>Total Products: <b>{productStats.totalProducts}</b></p>
            <ul className="list mt-8">
              {Object.entries(productStats.categories).map(([cat, count]) => (
                <li key={cat}>
                  {cat || "Uncategorized"} — <b>{count}</b>
                </li>
              ))}
            </ul>
          </div>

          <div className="card">
            <div className="bold mb-8">Total Sales Per Product</div>
            {Object.keys(productStats.sales).length === 0 ? (
              <p className="muted small">No sales yet.</p>
            ) : (
              <ul className="list mt-8">
                {products.map((p) => (
                  <li key={p.id}>
                    {p.name} — Sold <b>{productStats.sales[p.id] || 0}</b>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Manage Products */}
        <div className="card mt-16">
          <div className="bold mb-8">Manage Products</div>
          {products.length === 0 ? (
            <p className="muted small">No products available.</p>
          ) : (
            <ul className="list vstack gap-8">
              {products.map((p) => (
                <li key={p.id} className="row between">
                  <span>
                    <b>{p.name}</b> — ${p.price.toFixed(2)} ({p.category || "Uncategorized"})
                  </span>
                  <button className="btn-danger" onClick={() => deleteProduct(p.id)}>
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function AddProductPage({ user, go }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result); // base64 string
    };
    reader.readAsDataURL(file);
  };

  const addProduct = () => {
    if (!name || !price) return alert("Please enter product name and price");
    const prods = LS.getProducts();
    const p = {
      id: Date.now(),
      name,
      price: parseFloat(price),
      description,
      category,
      image, // this is base64 now
    };
    LS.setProducts([p, ...prods]);
    alert("Product added");
    setName("");
    setPrice("");
    setDescription("");
    setCategory("");
    setImage("");
    go("admin.dashboard");
  };

  return (
    <div>
      <Navbar user={user} go={go} />
      <div className="page">
        <div className="card w-600 mx-auto">
          <h1>Add Product</h1>
          <div className="vstack gap-12 mt-12">
            <input className="input" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <input className="input" type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} />
            <input className="input" placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
            
            {/* File input for image */}
            <input type="file" accept="image/*" onChange={handleImageUpload} />
            {image && <img src={image} alt="Preview" style={{ width: "150px", marginTop: "10px", borderRadius: "8px" }} />}

            <textarea className="input" placeholder="Description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
            <div className="right hstack gap-8">
              <button onClick={() => go("admin.dashboard")} className="btn">Cancel</button>
              <button onClick={addProduct} className="btn-success">Save</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


function ViewOrdersPage({ user, go }) {
  const [orders, setOrders] = useState(LS.getOrders());

  const updateStatus = (id, status) => {
    const next = orders.map((o) => (o.id === id ? { ...o, status } : o));
    setOrders(next);
    LS.setOrders(next);
  };

  const exportCSV = () => {
    if (orders.length === 0) return alert("No orders to export");
    const rows = [["Order ID", "User", "Status", "Total", "Created At", "Address", "Phone", "Items"]];
    orders.forEach((o) => {
      const itemsText = o.items
        .map((it) => {
          const p = LS.getProducts().find((pp) => pp.id === it.productId);
          return `${p?.name || "Unknown"} x${it.qty}`;
        })
        .join(" | ");
      rows.push([o.id, o.user, o.status, o.total.toFixed(2), o.createdAt, o.address, o.phone, itemsText]);
    });
    downloadCSV("orders_export.csv", rows);
  };

  return (
    <div>
      <Navbar user={user} go={go} />
      <div className="page">
        <div className="row between">
          <h1>All Orders</h1>
          <div className="hstack gap-8">
            <button onClick={exportCSV} className="btn-dark">Export CSV</button>
            <button onClick={() => setOrders(LS.getOrders())} className="btn">Refresh</button>
          </div>
        </div>

        {orders.length === 0 ? (
          <p className="muted mt-12">No orders yet.</p>
        ) : (
          <div className="vstack gap-12 mt-12">
            {orders.map((o) => (
              <div key={o.id} className="card">
                <div className="row between">
                  <div>
                    <div className="bold">Order #{o.id} • {o.user}</div>
                    <div className="muted small">
                    {new Date(o.createdAt).toLocaleString()} • ${typeof o.total === "number" ? o.total.toFixed(2) : "0.00"}
                    </div>
                    <div className="muted small mt-4">Address: {o.address} | Phone: {o.phone}</div>
                  </div>
                  <div className="hstack gap-8">
                    <span className="chip">{o.status}</span>
                    <button className="btn" onClick={() => updateStatus(o.id, "Delivered")}>Mark Delivered</button>
                    <button className="btn" onClick={() => updateStatus(o.id, "Cancelled")}>Cancel</button>
                  </div>
                </div>
                <ul className="list mt-12">
                  {o.items.map((it, idx) => {
                    const p = LS.getProducts().find((pp) => pp.id === it.productId);
                    return (
                      <li key={idx}>
                        {p?.name} — Qty {it.qty} × ${it.priceAtPurchase}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ViewCustomersPage({ user, go }) {
  const customers = LS.getUsers().filter((u) => u.role === "user");
  return (
    <div>
      <Navbar user={user} go={go} />
      <div className="page">
        <h1>Customers</h1>
        {customers.length === 0 ? (
          <p className="muted mt-12">No customers yet.</p>
        ) : (
          <div className="table">
            <div className="table__row table__head">
              <div>Username</div>
              <div>Role</div>
            </div>
            {customers.map((c, idx) => (
              <div key={idx} className="table__row">
                <div>{c.username}</div>
                <div>{c.role}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/********************
 * MAIN APP ROUTER (single-file)
 ********************/
export default function App() {
  const [route, setRoute] = useState("init");
  const [user, setUser] = useState(null);
  const [params, setParams] = useState({});

  useEffect(() => {
    seed();
    const sess = LS.getSession();
    if (sess) {
      setUser(sess);
      if (sess.role === "admin") setRoute("admin.dashboard");
      else setRoute("user.dashboard");
    } else {
      setRoute("login");
    }
  }, []);

  const go = (r, p = {}) => {
    if (r === "logout") {
      LS.clearSession();
      setUser(null);
      setRoute("login");
      return;
    }
    setParams(p);
    setRoute(r);
  };

  const cartCount = user?.role === "user" ? LS.getCart(user.username).length : 0;

  // Auth routes
  if (route === "login")
    return (
      <Login
        onLogin={(u) => {
          setUser(u);
          u.role === "admin" ? setRoute("admin.dashboard") : setRoute("user.dashboard");
        }}
        onSwitchToSignup={() => setRoute("signup")}
      />
    );
  if (route === "signup") return <Signup onSwitchToLogin={() => setRoute("login")} />;

  // User routes
  if (user?.role === "user") {
    if (route === "user.dashboard") return <UserDashboard user={user} go={go} cartCount={cartCount} />;
    if (route === "user.product") return <ProductPage user={user} go={go} productId={params.id} />;
    if (route === "user.cart") return <CartPage user={user} go={go} />;
    if (route === "user.payment") return <PaymentPage user={user} go={go} />;
    if (route === "user.orders") return <OrdersPage user={user} go={go} />;
  }

  // Admin routes
  if (user?.role === "admin") {
    if (route === "admin.dashboard") return <AdminDashboard user={user} go={go} />;
    if (route === "admin.addProduct") return <AddProductPage user={user} go={go} />;
    if (route === "admin.viewOrders") return <ViewOrdersPage user={user} go={go} />;
    if (route === "admin.viewCustomers") return <ViewCustomersPage user={user} go={go} />;
  }

  return <div className="page">Not Found</div>;
}
