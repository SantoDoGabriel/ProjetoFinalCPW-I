//================= Lógica para o toast de notificações ==================
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');

    toastMessage.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

//================= Lógica para o carrossel de imagens ==================
const track = document.getElementById('carouselTrack');
const prevButton = document.getElementById('prevBtn');
const nextButton = document.getElementById('nextBtn');
const slides = track ? Array.from(track.children) : [];

let currentIndex = 0;

function updateCarouselPosition() {
    if (track) track.style.transform = `translateX(-${currentIndex * 100}%)`;
}

if (nextButton) {
    nextButton.addEventListener('click', () => {
        if (slides.length > 0) {
            if (currentIndex < slides.length - 1) {
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
            if (currentIndex > 0) {
                currentIndex--;
            } else {
                currentIndex = slides.length - 1;
            }
            updateCarouselPosition();
        }
    });
}

// Auto-play a cada 5 segundos apenas se o botão existir
if (nextButton) {
    setInterval(() => {
        nextButton.click();
    }, 5000);
}

//================= Lógica para o carrinho de compras ==================
let cart = JSON.parse(localStorage.getItem('florDoNorteCart')) || [];

// Função para salvar o carrinho no localStorage
function saveCart() {
    localStorage.setItem('florDoNorteCart', JSON.stringify(cart));

    if (document.querySelector('.cartItemsList')) {
        renderCartPage();
    }

    // Atualiza o número total de itens no ícone do carrinho no header
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartBadge = document.querySelector('.cartBadge');
    if (cartBadge) {
        cartBadge.textContent = totalItems;
        cartBadge.style.display = totalItems > 0 ? 'flex' : 'none';
    }

    updateHeaderCartDropdown();
}

// Função para adicionar um item ao carrinho
function addToCart(id, name, price, description) {
    if (!id) return;

    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
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
    showToast(`${name} adicionado ao carrinho!`);
}

// Listener para os botões "Adicionar ao Carrinho"
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btnAddToCart');
    if (btn) {
        addToCart(
            btn.getAttribute('data-id'),
            btn.getAttribute('data-name'),
            btn.getAttribute('data-price'),
            btn.getAttribute('data-description')
        );
    }
});

// Função para renderizar a página do carrinho
function renderCartPage() {
    const cartItemsList = document.querySelector('.cartItemsList');
    if (!cartItemsList) return;

    if (cart.length === 0) {
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

// Função para atualizar o resumo do carrinho
function updateSummary(totalItems, totalPrice) {
    const finalPriceElement = document.querySelector('.finalPrice');
    if (!finalPriceElement) return;

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

// Função para atualizar o Dropdown do Header com limite de até 2 itens
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

    // Icone que mostra o número total de itens no carrinho
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartBadge = document.querySelector('.cartBadge');
    if (cartBadge) {
        cartBadge.textContent = totalItems;
        cartBadge.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

// Listener para mudanças na quantidade dos itens nas caixas de input
document.addEventListener('change', (e) => {
    if (e.target.classList.contains('qtyInput')) {
        const id = e.target.getAttribute('data-id');
        const newQuantity = parseInt(e.target.value);

        const item = cart.find(item => item.id === id);
        if (item && newQuantity > 0) {
            item.quantity = newQuantity;
            saveCart();
        }
    }
});

// Listener para remover itens individuais ou limpar tudo
document.addEventListener('click', (e) => {
    const removeBtn = e.target.closest('.btnRemoveItem');
    if (removeBtn) {
        const id = removeBtn.getAttribute('data-id');
        cart = cart.filter(item => item.id !== id);
        saveCart();
    }

    if (e.target.classList.contains('btnClearCart') || e.target.closest('.btnClearCart')) {
        if (confirm('Tem certeza que deseja limpar o carrinho?')) {
            cart = [];
            saveCart();
        }
    }
});

// Executa a carga inicial do estado assim que a página termina de abrir
document.addEventListener('DOMContentLoaded', () => {
    updateHeaderCartDropdown();
    if (document.querySelector('.cartItemsList')) {
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
    // 1. BOMBONS
    {   id: "bombom-cupuacu", 
        name: "Bombom de Cupuaçu Artesanal", 
        price: 10.00, 
        description: "Recheio cremoso e azedinho de polpa pura, coberto com casquinha de chocolate meio amargo.", 
        category: "bombom", 
        image: "./images/produtos/bombom-cupuacu.png" 
    },
    {   id: "bombom-bacuri-fino", 
        name: "Bombom de Bacuri Fino", 
        price: 11.50, 
        description: "Casca de chocolate ao leite recheada com a raríssima e perfumada polpa de bacuri selvagem.", 
        category: "bombom",
        image: "./images/produtos/bombom-bacuri.png"
    },
    {   id: "bombom-castanha-para-fondant", 
        name: "Bombom de Castanha-do-Pará no Fondant", 
        price: 10.00, 
        description: "Uma castanha inteira tostada e crocante, envolvida em açúcar fondant e cobertura de chocolate blend.", 
        category: "bombom",
        image: "./images/produtos/bombom-castanha-para.png" 
    },
    {   id: "caixa-bombons-sortidos", 
        name: "Caixa de Bombons Sortidos da Floresta (12 unid.)", 
        price: 110.00, 
        description: "Caixa decorada contendo um mix com 4 bombons de cupuaçu, 4 de bacuri e 4 de castanha.", 
        category: "bombom",
        image: "./images/produtos/bombons-sortidos-floresta.png" 
    },

    // 2. DOCES DE POTE
    {   id: "doce-cupuacu-pasta", 
        name: "Doce de Cupuaçu em Pasta Tradicional (260g)", 
        price: 57.90, 
        description: "Cozimento lento da fruta com açúcar na medida certa. Textura densa ideal para comer com queijo ou de colher.", 
        category: "doce de pote",
        image: "./images/produtos/doce-cupuacu-pastoso.png" 
    },
    {   id: "doce-pastoso-buriti", 
        name: "Doce Pastoso de Buriti (250g)", 
        price: 48.00, 
        description: "Doce encorpado feito com a polpa da palmeira de buriti. Cor alaranjada linda e sabor denso e tropical.", 
        category: "doce de pote", 
        image: "./images/produtos/doce-buriti.png" 
    },
    {   id: "geleia-tapereba-caja", 
        name: "Geleia de Taperebá / Cajá Manioca (130g)", 
        price: 29.90, 
        description: "Geleia brilhante e de acidez equilibrada, perfeita para torradas e harmonização com queijos fortes.", 
        category: "doce de pote", 
        image: "./images/produtos/geleia-taperebá.png"
    },
    {   id: "geleia-tucupi-pimenta", 
        name: "Geleia Agridoce de Tucupi com Pimenta (150g)", 
        price: 34.99, 
        description: "Redução do sumo da mandioca brava (tucupi) com pimentas regionais, criando um contraste doce-picante incrível.", 
        category: "doce de pote",
        image: "./images/produtos/geleia-cpuacu-pimenta-cheiro.png" 
    },

    // 3. PERFUMARIAS (CHOCOLATES COM ESPECIARIAS)
    {   id: "choc-branco-cumaru", 
        name: "Chocolate Branco com Cumaru Gaudens (70g)", 
        price: 39.00, 
        description: "Chocolate branco nobre aromatizado com as sementes de cumaru, a baunilha da Amazônia.", 
        category: "perfumarias", 
        image: "./images/produtos/chocolate-branco-cumaru.png" 
    },
    {   id: "choc-intenso-priprioca", 
        name: "Chocolate Intenso com Priprioca 65% (70g)", 
        price: 41.90, 
        description: "Cacau selvagem nativo combinado com as notas amadeiradas e raras da raiz de priprioca.", 
        category: "perfumarias",
        image: "./images/produtos/chocolate-intenso-puxuri.png" 
    },
    {   id: "choc-leite-acai-castanha", 
        name: "Chocolate ao Leite 52% com Açaí e Castanha (70g)", 
        price: 41.90, 
        description: "A união da cremosidade do leite, a crocância da castanha e os flocos desidratados de açaí.", 
        category: "perfumarias",
        image: "./images/produtos/chocolate-crisp-acai.png" 
    },
    {   id: "cripioca-leite-cupuacu", 
        name: "Cripioca ao Leite com Cupuaçu Gaudens (70g)", 
        price: 45.00, 
        description: "Flocos crocantes de tapioca envoltos em chocolate ao leite 53% com toque azedinho de cupuaçu.", 
        category: "perfumarias",
        image: "./images/produtos/cripioca-leite-cupuacu-gaudens.png" 
    },

    // 4. CAFÉZINHO (BISCOITOS E CROCANTES)
    {   id: "biscoito-rosca-castanha", 
        name: "Biscoito Rosca de Castanha-do-Pará (50g)", 
        price: 20.00, 
        description: "Sequilhos artesanais e amanteigados produzidos com alta porcentagem de farinha de castanha pura.", 
        category: "cafezinho",
        image: "./images/produtos/biscoito-castanha-para.png"   
    },
    {   id: "castanhas-glaciadas-mel", 
        name: "Castanhas Glaciadas com Mel de Abelha Nativa (100g)", 
        price: 38.00, 
        description: "Castanhas inteiras e assadas, caramelizadas com o delicado mel de abelhas sem ferrão da região.", 
        category: "cafezinho",
        image: "./images/produtos/castanhas-glaciadas-mel-abelha-nativa.png" 
    },
    {   id: "beiju-tapioca-coco", 
        name: "Beiju de Tapioca Doce com Coco (100g)", 
        price: 18.00, 
        description: "Discos finíssimos e crocantes de tapioca hidratada, tostados na chapa com raspas de coco seco.", 
        category: "cafezinho",
        image: "./images/produtos/beiju-tapioca-doce-coco.png" 
    },
    {   id: "granola-tapioca-amazonia", 
        name: "Granola de Tapioca da Amazônia (200g)", 
        price: 32.90, 
        description: "Mix crocante de tapioca flocada, castanhas quebradas e nibs de cacau nativo.", 
        category: "cafezinho",
        image: "./images/produtos/granola-tapioca-amazonia.png" 
    },

    // 5. CESTAS
    {   id: "cesta-cafe-ver-o-peso", 
        name: "Cesta Café no Ver-o-Peso", 
        price: 165.00, 
        description: "Contém: 1 pacote de Café Artesanal, 1 Pote de Doce de Cupuaçu (260g), 1 pacote de Sequilhos de Castanha e 1 pacote de Farinha de Tapioca Flocada.", 
        category: "cestas",
        image: "./images/produtos/cesta-cafe-ver-o-peso.png" 
    },
    {   id: "cesta-noite-amazonica", 
        name: "Cesta Noite Amazônica", 
        price: 220.00, 
        description: "Contém: 1 garrafa de Licor de Jambu (275ml), 1 Caixa de Bombons finos e 1 barra de Chocolate Intenso com Cumaru.", 
        category: "cestas", 
        image: "./images/produtos/cesta-noite-amazonica.png"
    },
    {   id: "cesta-tesouros-floresta", 
        name: "Cesta Tesouros da Floresta (Premium)", 
        price: 390.00, 
        description: "Contém: 1 Vinho de Açaí (750ml), 1 Geleia de Taperebá, 1 Pote de Castanhas Glaciadas, 1 Barra Gaudens de Cumaru e 1 Cuia Amazônica artesanal.", 
        category: "cestas",
        image: "./images/produtos/.png"
    },
    {   id: "mini-cesta-mimos-norte", 
        name: "Mini Cesta Mimos do Norte", 
        price: 85.00, 
        description: "Contém: 1 Pote de Geleia de Cupuaçu (150g), 1 pacote de Biscoito de Castanha (50g) e 3 Bombons artesanais sortidos.", 
        category: "cestas",
        image: "./images/produtos/.png" 
    },

    // 6. SOBREMESAS
    {   id: "torta-paraense-fatia", 
        name: "Torta Paraense (Fatia)", 
        price: 24.00, 
        description: "Camadas de pão de ló intercaladas com creme aveludado de cupuaçu e cobertura generosa de castanhas trituradas.", 
        category: "sobremesas", 
        image:"./images/Produtos/fatia-de-torta-paraense.png" 
    },
    {   id: "crepe-casamento-perfeito", 
        name: "Crepe Casamento Perfeito", 
        price: 28.00, 
        description: "Crepe francês recheado com creme de cupuaçu artesanal e ganache de brigadeiro de cacau 54%.", 
        category: "sobremesas",
        image: "./images/produtos/.png" 
    },
    {   id: "taca-cupuacu-cumaru", 
        name: "Taça Cupuaçu com Brigadeiro de Cumaru", 
        price: 22.00, 
        description: "Camadas intercaladas de mousse ácida de cupuaçu e brigadeiro cremoso aromatizado com semente de cumaru.", 
        category: "sobremesas",
        image: "./images/produtos/.png" 
    },
    {   id: "sorvete-tapioca-acai", 
        name: "Sorvete Artesanal de Tapioca com Calda de Açaí", 
        price: 26.00, 
        description: "Duas bolas de sorvete de massa feito com pedacinhos de tapioca, cobertos por calda morna e densa de açaí puro.", 
        category: "sobremesas",
        image: "./images/produtos/.png" 
    }
];

// Renderiza a página de produtos (pesquisa ou catálogo)
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
    else if (categoriaFiltro) {
        // Mapeamento das categorias
        const titulosCategorias = {
            'bombom': 'Bombons Artesanais',
            'doce de pote': 'Doces de Pote',
            'perfumarias': 'Perfumaria da Floresta',
            'cafezinho': 'Cafézinho & Crocantes',
            'cestas': 'Cestas de Experiência',
            'sobremesas': 'Sobremesas de Vitrine'
        };

        // Define o título da página baseado no mapeamento ou usa um título genérico caso não encontre
        pageTitle.textContent = titulosCategorias[categoriaFiltro] || 'Produtos Regionais';

        // Filtra os produtos com base na nova categoria selecionada
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
        <div class="productCardImage">
            <img src="${produto.image || './images/Produtos/placeholder.jpg'}" alt="${produto.name}" class="productImg">
        </div>
        <p>${produto.name}</p>
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

//================= Simulação de finalização de compra (demonstração) ==================
document.addEventListener('click', (e) => {
    const checkoutBtn = e.target.closest('.btnProceedCheckout');

    if (checkoutBtn) {
        // Verifica se o carrinho está vazio antes de finalizar a compra
        if (cart.length === 0) {
            showToast('Seu carrinho está vazio! Adicione itens antes de finalizar a compra. 🍰');
            return;
        }

        // Mensagem de agradecimento e simulação de finalização
        alert('Compra finalizada com sucesso! Obrigado por escolher a Flor do Norte! 🌸');

        // Finaliza a compra limpando o carrinho
        cart = [];
        saveCart();
    }
});