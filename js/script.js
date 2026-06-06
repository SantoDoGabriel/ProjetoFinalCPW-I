//================= Lógica para o carrossel de imagens ==================
const track = document.getElementById('carouselTrack');
const prevButton = document.getElementById('prevBtn');
const nextButton = document.getElementById('nextBtn');
const slides = track ? Array.from(track.children) : [];

let currentIndex = 0;

function updateCarouselPosition(){
    if (track) track.style.transform = `translateX(-${currentIndex * 100}%)`;
}

if (nextButton) {
    nextButton.addEventListener('click', () => {
        if (slides.length > 0) {
            if (currentIndex < slides.length - 1){
                currentIndex++;
            } else {
                currentIndex = 0;
            }
            updateCarouselPosition();
        }
    });
}

if (prevButton) {
    prevButton.addEventListener('click', () => {
        if (slides.length > 0) {
            if(currentIndex > 0){
                currentIndex--;
            } else {
                currentIndex = slides.length - 1;
            }
            updateCarouselPosition();
        }
    });
}

// Auto-play a cada 5 segundos apenas se o botão existir (index.html)
if (nextButton) {
    setInterval(() => {
        nextButton.click();
    }, 5000);
}

//================= Lógica para o carrinho de compras ==================
let cart = JSON.parse(localStorage.getItem('florDoNorteCart')) || [];

// Função para salvar o carrinho no localStorage
function saveCart(){
    localStorage.setItem('florDoNorteCart', JSON.stringify(cart));
    
    if (document.querySelector('.cartItemsList')){
        renderCartPage();
    }
    
    updateHeaderCartDropdown();
}

// Função para adicionar um item ao carrinho
function addToCart(id, name, price, description){
    if (!id) return;
    
    const existingItem = cart.find(item => item.id === id);

    if (existingItem){
        existingItem.quantity++;
    } else {
        const item = {
            id: id,
            name: name,
            price: parseFloat(price),
            description: description || '',
            quantity: 1
        };
        cart.push(item);
    }
    saveCart();
    alert(`${name} adicionado ao carrinho!`);
}

// Listener CORRIGIDO para os botões "Adicionar ao Carrinho" (suporta clique no ícone)
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btnAddToCart');
    if (btn){
        addToCart(
            btn.getAttribute('data-id'),
            btn.getAttribute('data-name'),
            btn.getAttribute('data-price'),
            btn.getAttribute('data-description')
        );
    }
});

// Função para renderizar a página do carrinho
function renderCartPage(){
    const cartItemsList = document.querySelector('.cartItemsList');
    if(!cartItemsList) return;

    if(cart.length === 0){
        cartItemsList.innerHTML = `
            <div class="empty-cart-message" style="padding: 40px; text-align: center; color: #666; font-weight: normal;">
                <p>Seu carrinho está vazio no momento. 🙁</p>
            </div>
        `;
        updateSummary(0, 0);
        return;
    }

    cartItemsList.innerHTML = '';
    let totalItems = 0;
    let totalPrice = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        totalItems += item.quantity;
        totalPrice += itemTotal;

        const itemRow = document.createElement('div');
        itemRow.classList.add('cartItemRow');
        itemRow.innerHTML = `
            <div class="cartItemImgPlaceholder">Imagem</div>
            
            <div class="cartItemDetails">
                <h3 class="cartItemTitle">${item.name}</h3>
                <p class="cartItemDesc">${item.description}</p>
                <span class="cartItemUnitPrice">Preço unitário: R$ ${item.price.toFixed(2).replace('.', ',')}</span>
            </div>

            <div class="cartItemActions">
                <div class="quantityControl">
                    <label>Qtd:</label>
                    <input type="number" value="${item.quantity}" min="1" class="qtyInput" data-id="${item.id}">
                </div>
                <span class="cartItemTotalPrice">R$ ${itemTotal.toFixed(2).replace('.', ',')}</span>
                <button class="btnRemoveItem" data-id="${item.id}" title="Remover item"><i class="fa-solid fa-xmark"></i></button>
            </div>
        `;
        cartItemsList.appendChild(itemRow);
    });
    updateSummary(totalItems, totalPrice);
}

// Função CORRIGIDA e segura para atualizar o resumo do carrinho
function updateSummary(totalItems, totalPrice){
    const finalPriceElement = document.querySelector('.finalPrice');
    if(!finalPriceElement) return;

    // Seleção segura baseada nas posições reais das linhas de resumo
    const summaryRows = document.querySelectorAll('.summaryRow');
    if (summaryRows.length >= 1) {
        const labelSpan = summaryRows[0].querySelector('span:nth-child(1)');
        const valueSpan = summaryRows[0].querySelector('span:nth-child(2)');
        
        if (labelSpan) labelSpan.textContent = `Subtotal (${totalItems} ${totalItems === 1 ? 'item' : 'itens'})`;
        if (valueSpan) valueSpan.textContent = `R$ ${totalPrice.toFixed(2).replace('.', ',')}`;
    }

    finalPriceElement.textContent = `R$ ${totalPrice.toFixed(2).replace('.', ',')}`;
}

// Função para atualizar o Dropdown do Header com limite de até 2 itens reais
function updateHeaderCartDropdown() {
    const previewList = document.querySelector('.cart-preview-list');
    if (!previewList) return;

    if (cart.length === 0) {
        previewList.innerHTML = `<li style="padding: 15px; text-align: center; color: #999; font-size: 0.85rem; font-weight: normal;">Carrinho vazio</li>`;
        return;
    }

    // Filtra para pegar apenas os 2 itens mais recentes adicionados
    const recentItems = cart.slice(-2);
    previewList.innerHTML = '';

    recentItems.forEach(item => {
        const li = document.createElement('li');
        li.classList.add('cart-preview-item');
        li.innerHTML = `
            <div class="item-img-placeholder"></div>
            <div class="item-info" style="font-weight: normal;">
                <span class="item-name" style="font-weight: bold; font-size: 0.85rem; display:block;">${item.name}</span>
                <span class="item-qty" style="font-size: 0.8rem; color: #666;">${item.quantity}x R$ ${item.price.toFixed(2).replace('.', ',')}</span>
            </div>
        `;
        previewList.appendChild(li);
    });
}

// Listener para mudanças na quantidade dos itens nas caixas de input
document.addEventListener('change', (e) => {
    if(e.target.classList.contains('qtyInput')){
        const id = e.target.getAttribute('data-id');
        const newQuantity = parseInt(e.target.value);

        const item = cart.find(item => item.id === id);
        if (item && newQuantity > 0){
            item.quantity = newQuantity;
            saveCart();
        }
    }
});

// Listener CORRIGIDO para remover itens individuais ou limpar tudo
document.addEventListener('click', (e) => {
    const removeBtn = e.target.closest('.btnRemoveItem');
    if (removeBtn){
        const id = removeBtn.getAttribute('data-id');
        cart = cart.filter(item => item.id !== id);
        saveCart();
    }

    if(e.target.classList.contains('btnClearCart') || e.target.closest('.btnClearCart')){
        if (confirm('Tem certeza que deseja limpar o carrinho?')){
            cart = [];
            saveCart();
        }
    }
});

// Executa a carga inicial do estado assim que a página termina de abrir
document.addEventListener('DOMContentLoaded', () => {
    updateHeaderCartDropdown();
    if (document.querySelector('.cartItemsList')){
        renderCartPage();
    }
});

//================= LÓGICA DE REDIRECIONAMENTO DA PESQUISA ==================
function executarPesquisa() {
    const searchInput = document.querySelector('.searchInput');
    if (!searchInput) return;

    const termo = searchInput.value.trim();
    if (termo !== "") {
        // Redireciona para a nova página levando o termo ex: produtos.html?busca=chocolate
        window.location.href = `produtos.html?busca=${encodeURIComponent(termo)}`;
    }
}

// Ouvintes para disparar a busca ao clicar na lupa ou dar Enter
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('.searchInput');
    const searchButton = document.querySelector('.searchButton');

    if (searchButton) {
        searchButton.addEventListener('click', (e) => {
            e.preventDefault();
            executarPesquisa();
        });
    }

    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                executarPesquisa();
            }
        });
    }
    
    // Executa a montagem do catálogo se estiver na página produtos.html
    if (document.getElementById('catalogGrid')) {
        renderizarPaginaCatalogo();
    }
});

// Banco de dados interno dos produtos da loja
const PRODUTOS_DB = [
    { id: "red-velvet", name: "Bolo Red Velvet", price: 85.00, description: "Massa de cacau aveludada, recheio de cream cheese frosting.", category: "bolos" },
    { id: "bolo-choco", name: "Bolo de Chocolate", price: 75.00, description: "Massa de brigadeiro artesanal belga.", category: "bolos" },
    { id: "bolo-cenoura", name: "Bolo de Cenoura", price: 60.00, description: "Cenoura com cobertura vulcão de chocolate.", category: "bolos" },
    { id: "bolo-morango", name: "Bolo de Morango", price: 90.00, description: "Pão de ló leve com morangos frescos e nata.", category: "bolos" },
    
    { id: "cup-baunilha", name: "Cupcake Baunilha", price: 12.00, description: "Massa de baunilha com creme de manteiga de baunilha.", category: "cupcakes" },
    { id: "cup-nozes", name: "Cupcake Nozes", price: 14.50, description: "Massa rústica de nozes com creme premium.", category: "cupcakes" },
    { id: "cup-ovomaltine", name: "Cupcake Ovomaltine", price: 13.00, description: "Creme crocante de Ovomaltine trufado.", category: "cupcakes" },
    { id: "cup-limao", name: "Cupcake Limão", price: 12.00, description: "Recheio cítrico refrescante de limão siciliano.", category: "cupcakes" }
];

function renderizarPaginaCatalogo() {
    const catalogGrid = document.getElementById('catalogGrid');
    const pageTitle = document.getElementById('pageTitle');
    if (!catalogGrid || !pageTitle) return;

    // Lê os parâmetros passados na URL do navegador
    const urlParams = new URLSearchParams(window.location.search);
    const termoBusca = urlParams.get('busca');
    const categoriaFiltro = urlParams.get('categoria');

    let produtosFiltrados = PRODUTOS_DB;

    // Usuário veio pela barra de pesquisa
    if (termoBusca) {
        const termoLower = termoBusca.toLowerCase();
        pageTitle.textContent = `Resultados para: "${termoBusca}"`;
        produtosFiltrados = PRODUTOS_DB.filter(p => 
            p.name.toLowerCase().includes(termoLower) || 
            p.description.toLowerCase().includes(termoLower)
        );
    } 
    // Usuário veio pelo link "Ver Todos" de uma categoria
    else if (categoriaFiltro) {
        const catNome = categoriaFiltro === 'bolos' ? 'Bolos Artesanais' : 'Cupcakes Boutique';
        pageTitle.textContent = catNome;
        produtosFiltrados = PRODUTOS_DB.filter(p => p.category === categoriaFiltro);
    } 
    // Usuário entrou direto na página sem parâmetros (Mostra tudo)
    else {
        pageTitle.textContent = "Nosso Cardápio Completo";
    }

    // Se não encontrou nenhum produto
    if (produtosFiltrados.length === 0) {
        catalogGrid.innerHTML = `<p style="color: #666; font-size: 1.1rem; padding: 20px 0;">Nenhum produto encontrado para o filtro selecionado. 🙁</p>`;
        return;
    }

    // Limpa o grid e desenha os cards filtrados usando o padrão visual do seu index.html
    catalogGrid.innerHTML = '';
    produtosFiltrados.forEach(produto => {
        const card = document.createElement('div');
        card.classList.add('productCard');
        card.innerHTML = `
            <div class="productImagePlaceholder">${produto.name}</div>
            <button class="btnAddToCart" 
                    data-id="${produto.id}" 
                    data-name="${produto.name}" 
                    data-price="${produto.price.toFixed(2)}" 
                    data-description="${produto.description}">
                <i class="fa-solid fa-cart-shopping"></i> Adicionar ao Carrinho
            </button>
        `;
        catalogGrid.appendChild(card);
    });
}