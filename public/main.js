(() => {
  const loginSection = document.getElementById('login-section');
  const appSection = document.getElementById('app-section');
  const loginForm = document.getElementById('login-form');
  const loginError = document.getElementById('login-error');
  const logoutBtn = document.getElementById('logout-btn');
  const productForm = document.getElementById('product-form');
  const formFields = productForm.elements;
  const idInput = formFields.namedItem('id');
  const productMessage = document.getElementById('product-message');
  const productError = document.getElementById('product-error');
  const productsBody = document.getElementById('products-body');
  const refreshBtn = document.getElementById('refresh-btn');
  const summaryCount = document.getElementById('summary-count');
  const summaryValue = document.getElementById('summary-value');
  const summaryLatest = document.getElementById('summary-latest');

  const apiBase = '/api';
  let token = localStorage.getItem('pm_token') || '';
  let products = [];

  function setLoggedIn(state) {
    if (state) {
      loginSection.classList.add('hidden');
      appSection.classList.remove('hidden');
      logoutBtn.hidden = false;
    } else {
      loginSection.classList.remove('hidden');
      appSection.classList.add('hidden');
      logoutBtn.hidden = true;
    }
  }

  async function request(path, options = {}) {
    const headers = options.headers || {};
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await fetch(`${apiBase}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(err.message || 'Request failed');
    }
    return response.json();
  }

  function renderProducts(list) {
    productsBody.innerHTML = '';
    list.forEach((p) => {
      const tr = document.createElement('tr');
      const total = (Number(p.price) * Number(p.quantity)).toFixed(2);
      tr.innerHTML = `
        <td>${p.name}</td>
        <td>\u20B9${Number(p.price).toFixed(2)}</td>
        <td>${p.quantity}</td>
        <td>\u20B9${total}</td>
        <td>
          <div class="actions">
            <button class="ghost" data-action="edit" data-id="${p.id}">Edit</button>
            <button class="ghost" data-action="delete" data-id="${p.id}">Delete</button>
          </div>
        </td>
      `;
      productsBody.appendChild(tr);
    });
  }

  async function loadProducts() {
    try {
      productError.textContent = '';
      const data = await request('/products');
      products = data;
      renderProducts(products);
    } catch (err) {
      productError.textContent = err.message;
    }
  }

  async function loadSummary() {
    try {
      const data = await request('/reports/summary');
      summaryCount.textContent = data.productCount;
      summaryValue.textContent = `\u20B9${Number(data.inventoryValue || 0).toFixed(2)}`;
      summaryLatest.textContent = data.latestProduct?.name || '—';
    } catch (err) {
      summaryCount.textContent = '—';
      summaryValue.textContent = '—';
      summaryLatest.textContent = '—';
    }
  }

  function resetForm() {
    productForm.reset();
    idInput.value = '';
    productMessage.textContent = '';
  }

  async function handleLogin(event) {
    event.preventDefault();
    loginError.textContent = '';
    const formData = new FormData(loginForm);
    const payload = Object.fromEntries(formData.entries());
    try {
      const data = await request('/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      token = data.token;
      localStorage.setItem('pm_token', token);
      setLoggedIn(true);
      await Promise.all([loadProducts(), loadSummary()]);
    } catch (err) {
      loginError.textContent = err.message;
    }
  }

  async function handleSaveProduct(event) {
    event.preventDefault();
    productMessage.textContent = '';
    productError.textContent = '';

    const formData = new FormData(productForm);
    const values = Object.fromEntries(formData.entries());
    const payload = {
      name: values.name,
      description: values.description,
      price: Number(values.price),
      quantity: Number(values.quantity),
    };

    const isEdit = Boolean(values.id);
    const path = isEdit ? `/products/${values.id}` : '/products';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const saved = await request(path, {
        method,
        body: JSON.stringify(payload),
      });

      if (isEdit) {
        products = products.map((p) => (p.id === saved.id ? saved : p));
      } else {
        products = [saved, ...products];
      }

      renderProducts(products);
      await loadSummary();
      productMessage.textContent = isEdit ? 'Product updated' : 'Product added';
      resetForm();
    } catch (err) {
      productError.textContent = err.message;
    }
  }

  productsBody.addEventListener('click', async (event) => {
    const btn = event.target.closest('button[data-action]');
    if (!btn) return;
    const { action, id } = btn.dataset;
    const product = products.find((p) => String(p.id) === String(id));
    if (!product) return;

    if (action === 'edit') {
      formFields.name.value = product.name;
      formFields.description.value = product.description || '';
      formFields.price.value = product.price;
      formFields.quantity.value = product.quantity;
      idInput.value = product.id;
      productMessage.textContent = 'Editing product';
    }

    if (action === 'delete') {
      const confirmDelete = window.confirm(`Delete ${product.name}?`);
      if (!confirmDelete) return;
      try {
        await request(`/products/${id}`, { method: 'DELETE' });
        products = products.filter((p) => String(p.id) !== String(id));
        renderProducts(products);
        await loadSummary();
      } catch (err) {
        productError.textContent = err.message;
      }
    }
  });

  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('pm_token');
    token = '';
    products = [];
    productsBody.innerHTML = '';
    resetForm();
    setLoggedIn(false);
  });

  loginForm.addEventListener('submit', handleLogin);
  productForm.addEventListener('submit', handleSaveProduct);
  refreshBtn.addEventListener('click', async () => {
    await Promise.all([loadProducts(), loadSummary()]);
  });

  (async function init() {
    if (token) {
      try {
        setLoggedIn(true);
        await Promise.all([loadProducts(), loadSummary()]);
      } catch (err) {
        localStorage.removeItem('pm_token');
        token = '';
        setLoggedIn(false);
      }
    } else {
      setLoggedIn(false);
    }
  })();
})();
