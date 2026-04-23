document.addEventListener('DOMContentLoaded', () => {
    // Select main sections using traversal
    const appContainer = document.getElementById('app-container');
    const menuSection = appContainer.firstElementChild;
    const cartSection = appContainer.lastElementChild;

    // Select items grid and cards
    const itemsGrid = menuSection.children[1];
    const itemCards = itemsGrid.children;

    // Select cart components
    const cartItemsContainer = cartSection.children[2];
    const cartFooter = cartSection.lastElementChild;
    const totalRow = cartFooter.firstElementChild;
    const summaryRow = totalRow.firstElementChild;
    const summaryText = summaryRow.lastElementChild;
    const totalAmountSpan = totalRow.lastElementChild;

    // Add click listeners to item cards
    Array.from(itemCards).forEach(card => {
        card.addEventListener('click', () => {
            // Traverse from card to name and price
            const itemInfo = card.lastElementChild;
            const itemName = itemInfo.firstElementChild.textContent;
            const itemPriceTag = itemInfo.lastElementChild;
            const itemPrice = itemPriceTag.textContent.replace('$', '').trim();

            addItemToCart(itemName, itemPrice);
        });
    });

    function addItemToCart(name, price) {
        let existingItem = null;

        // Traverse cart items to find a match
        let currentCartItem = cartItemsContainer.firstElementChild;
        while (currentCartItem) {
            if (currentCartItem.classList.contains('cart-item')) {
                const details = currentCartItem.firstElementChild;
                const nameEl = details.firstElementChild;
                if (nameEl && nameEl.textContent === name) {
                    existingItem = currentCartItem;
                    break;
                }
            }
            currentCartItem = currentCartItem.nextElementSibling;
        }

        if (existingItem) {
            // Traverse existing item to update quantity and price
            const details = existingItem.firstElementChild;
            const subElement = details.lastElementChild; // .item-sub

            const actions = existingItem.lastElementChild;
            const totalElement = actions.firstElementChild; // .item-price

            const qtyParts = subElement.textContent.split('x');
            const currentQty = parseInt(qtyParts[1].trim());
            const newQty = currentQty + 1;

            subElement.textContent = `$${price} x ${newQty}`;
            totalElement.textContent = `$${(parseFloat(price) * newQty).toFixed(2)}`;
        } else {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';

            cartItem.innerHTML = `
                <div class="item-details">
                    <div class="item-name">${name}</div>
                    <div class="item-sub">$${price} x 1</div>
                </div>
                <div class="item-price-actions">
                    <div class="item-price">$${price}</div>
                    <div class="item-remove-btn"><i class="fas fa-trash-alt"></i></div>
                </div>
            `;

            cartItemsContainer.appendChild(cartItem);
        }

        cartItemsContainer.scrollTop = cartItemsContainer.scrollHeight;
        updateCartTotals();
    }

    function updateCartTotals() {
        let totalItems = 0;
        let totalQty = 0;
        let grandTotal = 0;

        let item = cartItemsContainer.firstElementChild;
        while (item) {
            if (item.classList.contains('cart-item')) {
                totalItems++;

                const details = item.firstElementChild;
                const subText = details.lastElementChild.textContent;
                const qty = parseInt(subText.split('x')[1].trim());
                totalQty += qty;

                const actions = item.lastElementChild;
                const priceText = actions.firstElementChild.textContent.replace('$', '').trim();
                grandTotal += parseFloat(priceText);
            }
            item = item.nextElementSibling;
        }

        // Update UI using traversal
        if (summaryText) {
            summaryText.textContent = `(Items: ${totalItems}, Quantity: ${totalQty})`;
        }

        if (totalAmountSpan) {
            totalAmountSpan.innerHTML = `<span class="real-currency" style="font-size: 1rem; color: #2B6CB0; opacity: 0.8;">$</span>${grandTotal.toFixed(2)}`;
        }
    }

    // Initial call
    updateCartTotals();

    // Handle removal using traversal for parent finding
    cartItemsContainer.addEventListener('click', (e) => {
        let target = e.target;
        // Check if clicked element or its parent is the remove button
        while (target && target !== cartItemsContainer) {
            if (target.classList.contains('item-remove-btn')) {
                const item = target.parentNode.parentNode;
                item.classList.add('removing');
                setTimeout(() => {
                    item.parentNode.removeChild(item);
                    updateCartTotals();
                }, 200);
                break;
            }
            target = target.parentNode;
        }
    });

    // Search logic using traversal
    const searchContainer = menuSection.firstElementChild;
    const searchInput = searchContainer.firstElementChild;

    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        let card = itemsGrid.firstElementChild;

        while (card) {
            if (card.classList.contains('item-card')) {
                const itemInfo = card.lastElementChild;
                const name = itemInfo.firstElementChild.textContent.toLowerCase();

                if (name.includes(term)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            }
            card = card.nextElementSibling;
        }
    });
});
