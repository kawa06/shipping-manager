// localStorage キー
const STORAGE_KEY = 'shippingProducts';

// 現在のフィルター
let currentFilter = 'all';

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    console.log('[DEBUG] DOMContentLoaded fired');
    renderProducts();
    setupEventListeners();
});

// イベントリスナー設定
function setupEventListeners() {
    const form = document.getElementById('addForm');
    console.log('[DEBUG] Found form:', !!form);

    // フォーム送信
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        console.log('[DEBUG] Form submitted, defaultPrevented:', e.defaultPrevented);
        addProduct();
    });

    // フィルターボタン
    document.querySelectorAll('.btn-filter').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderProducts();
        });
    });
}

// 商品取得
function getProducts() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    try {
        return JSON.parse(data);
    } catch (e) {
        console.error('localStorage parse error:', e);
        return [];
    }
}

// 商品保存
function saveProducts(products) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch (e) {
        console.error('localStorage save error:', e);
        alert('データの保存に失敗しました。ブラウザのストレージ設定を確認してください。');
    }
}

// 商品追加
function addProduct() {
    console.log('[DEBUG] addProduct() called');

    const product = {
        id: Date.now(),
        name: document.getElementById('productName').value,
        store: document.getElementById('store').value,
        buyer: document.getElementById('buyer').value,
        price: parseInt(document.getElementById('price').value) || 0,
        shippingMethod: document.getElementById('shippingMethod').value,
        memo: document.getElementById('memo').value,
        packaged: false,
        shipped: false,
        notified: false,
        createdAt: new Date().toISOString()
    };
    console.log('[DEBUG] Product object:', product);

    const products = getProducts();
    products.unshift(product);
    saveProducts(products);
    console.log('[DEBUG] Saved products count:', products.length);

    // フォームリセット
    document.getElementById('addForm').reset();

    renderProducts();
    console.log('[DEBUG] renderProducts() called after add');
}

// 状態切り替え
function toggleStatus(id, status) {
    const products = getProducts();
    const product = products.find(p => p.id === id);
    if (product) {
        product[status] = !product[status];
        saveProducts(products);
        renderProducts();
    }
}

// 商品削除
function deleteProduct(id) {
    if (!confirm('この商品を削除しますか？')) return;
    const products = getProducts().filter(p => p.id !== id);
    saveProducts(products);
    renderProducts();
}

// フィルター適用
function filterProducts(products) {
    switch (currentFilter) {
        case 'unpackaged':
            return products.filter(p => !p.packaged);
        case 'unshipped':
            return products.filter(p => !p.shipped);
        case 'unnotified':
            return products.filter(p => !p.notified);
        default:
            return products;
    }
}

// レンダリング
function renderProducts() {
    const container = document.getElementById('productList');
    const products = filterProducts(getProducts());

    if (products.length === 0) {
        container.innerHTML = '<div class="empty-state">商品がありません</div>';
        return;
    }

    container.innerHTML = products.map(product => `
        <div class="product-card">
            <div class="product-header">
                <div class="product-name">${escapeHtml(product.name)}</div>
                <div class="product-price">¥${product.price.toLocaleString()}</div>
            </div>
            <div class="product-info">販売先: ${escapeHtml(product.store)}</div>
            <div class="product-info">購入者: ${escapeHtml(product.buyer)}</div>
            <div class="product-info">発送方法: ${escapeHtml(product.shippingMethod)}</div>
            ${product.memo ? `<div class="product-memo">${escapeHtml(product.memo)}</div>` : ''}
            <div class="status-buttons">
                <button class="status-btn ${product.packaged ? 'done' : 'undone'}" 
                    onclick="toggleStatus(${product.id}, 'packaged')">
                    ${product.packaged ? '✓ 梱包済み' : '未梱包'}
                </button>
                <button class="status-btn ${product.shipped ? 'done' : 'undone'}" 
                    onclick="toggleStatus(${product.id}, 'shipped')">
                    ${product.shipped ? '✓ 発送済み' : '未発送'}
                </button>
                <button class="status-btn ${product.notified ? 'done' : 'undone'}" 
                    onclick="toggleStatus(${product.id}, 'notified')">
                    ${product.notified ? '✓ 発送連絡済み' : '未連絡'}
                </button>
            </div>
            <button class="delete-btn" onclick="deleteProduct(${product.id})">削除</button>
        </div>
    `).join('');
}

// HTMLエスケープ
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
