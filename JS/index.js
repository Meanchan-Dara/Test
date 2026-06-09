document.addEventListener('DOMContentLoaded', () => {
    // Select main sections using traversal
    const appContainer = document.getElementById('app-container');
    const menuSection = appContainer.firstElementChild;
    const cartSection = appContainer.lastElementChild;

    // Select items grid and cards
    const itemsGrid = document.getElementById('items-grid');

    // Global Error Handler for debugging
    window.onerror = function(msg, url, line, col, error) {
        if (itemsGrid) {
            const errDiv = document.createElement('div');
            errDiv.style.color = 'red';
            errDiv.style.padding = '20px';
            errDiv.style.gridColumn = '1 / -1';
            errDiv.innerHTML = `<strong>JS Error:</strong> ${msg} (Line ${line})`;
            itemsGrid.appendChild(errDiv);
        }
        return false;
    };

    // Select cart components
    const cartItemsContainer = cartSection.querySelector('.cart-items') || cartSection.children[2];
    const cartFooter = cartSection.querySelector('.cart-footer') || cartSection.lastElementChild;
    const totalRow = cartFooter ? cartFooter.firstElementChild : null;
    const summaryRow = totalRow ? totalRow.firstElementChild : null;
    const summaryText = summaryRow ? summaryRow.lastElementChild : null;
    const totalAmountSpan = totalRow ? totalRow.lastElementChild : null;

    let currentEditCard = null;

    // Local Storage Keys
    const STORAGE_KEY_ITEMS = 'pos_custom_items';
    const STORAGE_KEY_CART = 'pos_cart_items';

    // Default Items Array
    const defaultItems = [
        { name: "បាយឆាគ្រឿងសមុទ្យ", price: 3.00, image: "/Images/បាយឆាគ្រឿងសមុទ្យ.jpg" },
        { name: "បាយឆាលុកលាក់", price: 4.50, image: "/Images/បាយឆាលុកលាក់.jpg" },
        { name: "នំបញ្ចុកសម្លរប្រហើរ", price: 2.50, image: "/Images/នំបញ្ចុកសម្លរប្រហើរ.jpg" },
        { name: "បាយពងទាចៀន", price: 2.00, image: "/Images/បាយពងទាចៀន.jpg" },
        { name: "បាយឆា", price: 2.50, image: "/Images/បាយឆា.jpg" },
        { name: "មាន់ដុតទឹកឃ្មុំ", price: 10.00, image: "/Images/មាន់ដុតទឹកឃ្មុំ.jpg" },
        { name: "ប្រហុកខ្ទះ", price: 6.00, image: "/Images/ប្រហុកខ្ទះ.jpg" },
        { name: "អាម៉ុកត្រី", price: 3.50, image: "/Images/អាម៉ុក.jpg" },
        { name: "ប្រហិតត្រីបំពង", price: 3.00, image: "/Images/ប្រហិតត្រីបំពង.jpg" },
        { name: "ត្រីចៀនជួន", price: 4.00, image: "/Images/ត្រីចៀនជួន.jpg" },
        { name: "នំកង", price: 1.00, image: "/Images/នំកង.jpg" },
        { name: "នំបត់", price: 1.50, image: "/Images/នំបត់.jpg" },
        { name: "នំផ្លែអាយ", price: 1.00, image: "/Images/នំផ្លែអាយ.jpg" },
        { name: "នំអាកោត្នោត", price: 3.00, image: "/Images/នំអាកោត្នោត.jpg" },
        { name: "នំបាក់បិន", price: 2.00, image: "/Images/នំបាក.jpg" },
        { name: "ទឹកក្រូច", price: 2.50, image: "/Images/ទឹកក្រូច.jpg" },
        { name: "ទឹកមាន", price: 2.50, image: "/Images/ទឹកមាន.jpg" },
        { name: "ទឹកអំពៅ", price: 2.50, image: "/Images/ទឹកអំពៅ.jpg" },
        { name: "តែក្រូចឆ្មា", price: 2.50, image: "/Images/តែក្រូចឆ្មា.jpg" },
        { name: "ទឹកឪឡឹក", price: 2.50, image: "/Images/ទឹកឪឡឹក.jpg" }
    ];

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
        const cartItemsForStorage = [];

        let item = cartItemsContainer.firstElementChild;
        while (item) {
            if (item.classList.contains('cart-item') && !item.classList.contains('removing')) {
                totalItems++;

                const details = item.firstElementChild;
                const nameText = details.firstElementChild.textContent;
                const subText = details.lastElementChild.textContent;
                const qty = parseInt(subText.split('x')[1].trim());
                totalQty += qty;

                const price = parseFloat(subText.replace('$', '').split('x')[0].trim());
                cartItemsForStorage.push({ name: nameText, price, qty });

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
        
        // Save cart to local storage
        localStorage.setItem(STORAGE_KEY_CART, JSON.stringify(cartItemsForStorage));
    }

    // Load cart items from storage
    function loadCartItemsFromStorage() {
        const stored = localStorage.getItem(STORAGE_KEY_CART);
        if (stored) {
            const items = JSON.parse(stored);
            cartItemsContainer.innerHTML = ''; // clear hardcoded items
            items.forEach(item => {
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.innerHTML = `
                    <div class="item-details">
                        <div class="item-name">${item.name}</div>
                        <div class="item-sub">$${item.price.toFixed(2)} x ${item.qty}</div>
                    </div>
                    <div class="item-price-actions">
                        <div class="item-price">$${(item.price * item.qty).toFixed(2)}</div>
                        <div class="item-remove-btn"><i class="fas fa-trash-alt"></i></div>
                    </div>
                `;
                cartItemsContainer.appendChild(cartItem);
            });
        }
        updateCartTotals();
    }

    // Initial call
    loadCartItemsFromStorage();

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

    // Helper functions for storage manipulation
    function deleteItemFromStorage(name) {
        let items = JSON.parse(localStorage.getItem(STORAGE_KEY_ITEMS)) || [];
        items = items.filter(item => item.name !== name);
        localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(items));
    }

    function updateItemInStorage(oldName, newName, newPrice, newImageUrl) {
        let items = JSON.parse(localStorage.getItem(STORAGE_KEY_ITEMS)) || [];
        const index = items.findIndex(item => item.name === oldName);
        if (index !== -1) {
            items[index] = { name: newName, price: newPrice, imageUrl: newImageUrl };
            localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(items));
        }
    }

    // Helper to add new card to DOM and optionally save to storage
    function addNewCard(name, price, imageUrl, saveToStorage = true, appendToBottom = false) {
        let numPrice = parseFloat(price);
        if (isNaN(numPrice)) numPrice = 0;
        
        const card = document.createElement('div');
        card.className = 'item-card';
        card.dataset.name = name;
        card.dataset.price = numPrice;
        card.dataset.imageUrl = imageUrl;
        
        card.innerHTML = `
            <div class="card-actions">
                <button class="action-btn edit-btn" title="Edit Item"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete-btn" title="Delete Item"><i class="fas fa-trash-alt"></i></button>
            </div>
            <img src="${imageUrl}" alt="${name}" class="item-img" onerror="this.src='https://via.placeholder.com/150?text=No+Image'" />
            <div class="item-info">
              <div class="item-name-text">${name}</div>
              <div class="item-price-tag"><span class="real-currency">$</span>${numPrice.toFixed(2)}</div>
            </div>
        `;

        // Action Buttons
        const editBtn = card.querySelector('.edit-btn');
        const deleteBtn = card.querySelector('.delete-btn');

        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (window.openEditModal) {
                window.openEditModal(card);
            }
        });

        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('Are you sure you want to delete this item?')) {
                card.remove();
                deleteItemFromStorage(card.dataset.name);
            }
        });

        // Add event listener to new card
        card.addEventListener('click', () => {
            addItemToCart(card.dataset.name, parseFloat(card.dataset.price));
        });

        // Add to grid
        if (appendToBottom) {
            itemsGrid.appendChild(card);
        } else {
            itemsGrid.insertBefore(card, itemsGrid.firstChild);
        }

        if (saveToStorage) {
            const items = JSON.parse(localStorage.getItem(STORAGE_KEY_ITEMS)) || [];
            items.unshift({ name, price: numPrice, imageUrl });
            localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(items));
        }
    }

    // Initialize all items
    function initializeItems() {
        try {
            itemsGrid.innerHTML = ''; // clear grid

            let customItems = null;
            try {
                customItems = JSON.parse(localStorage.getItem(STORAGE_KEY_ITEMS));
                if (!Array.isArray(customItems)) {
                    customItems = null;
                }
            } catch (e) {
                customItems = null;
            }
            
            let hasMigrated = localStorage.getItem('pos_migrated_defaults_v3');

            if (!customItems || customItems.length === 0 || !hasMigrated) {
                const existing = Array.isArray(customItems) ? customItems : [];
                
                // Map default items
                const mappedDefaults = defaultItems.map(item => ({
                    name: item.name,
                    price: item.price,
                    imageUrl: item.image
                }));

                // Combine existing custom items and default items
                customItems = [...existing, ...mappedDefaults];
                
                // Remove duplicates by name
                const uniqueItems = [];
                const seen = new Set();
                for (const item of customItems) {
                    if (item && item.name && !seen.has(item.name)) {
                        seen.add(item.name);
                        uniqueItems.push(item);
                    }
                }
                customItems = uniqueItems;

                localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(customItems));
                localStorage.setItem('pos_migrated_defaults_v3', 'true');
            }

            // Render all items from storage
            for (let i = customItems.length - 1; i >= 0; i--) {
                const item = customItems[i];
                if (item && item.name) {
                    addNewCard(item.name, item.price, item.imageUrl, false, false);
                }
            }
        } catch (e) {
            console.error("Critical error in initializeItems:", e);
            itemsGrid.innerHTML = '<div style="padding: 20px; color: red;">Error loading items. Please clear browser data and refresh.</div>';
        }
    }

    initializeItems();

    // Add Item Modal Logic
    const addCardBtn = document.getElementById('add-card-btn');
    const modalOverlay = document.getElementById('add-item-modal');
    if (modalOverlay) {
        const closeBtns = modalOverlay.querySelectorAll('.close-modal, .close-modal-btn');
        const addItemForm = document.getElementById('add-item-form');
        
        // Image preview elements
        const imageInput = document.getElementById('item-image');
        const imagePreviewContainer = document.querySelector('.image-preview-container');
        const imagePreview = document.getElementById('image-preview');
        const removeImageBtn = document.getElementById('remove-image-btn');
        const fileUploadLabel = document.querySelector('.file-upload-label');

        function openModal() {
            currentEditCard = null;
            document.querySelector('.modal-header h2').textContent = 'Add New Item';
            modalOverlay.classList.add('active');
            addItemForm.reset();
            clearErrors();
            resetImagePreview();
        }
        
        window.openEditModal = function(card) {
            currentEditCard = card;
            document.querySelector('.modal-header h2').textContent = 'Edit Item';
            modalOverlay.classList.add('active');
            clearErrors();
            
            const name = card.dataset.name;
            const price = card.dataset.price;
            const imageUrl = card.dataset.imageUrl;

            document.getElementById('item-name').value = name;
            document.getElementById('item-price').value = price;
            
            // Set image preview
            imagePreview.src = imageUrl;
            imagePreviewContainer.style.display = 'block';
            fileUploadLabel.style.display = 'none';
        };

        function closeModal() {
            modalOverlay.classList.remove('active');
        }

        function resetImagePreview() {
            imagePreviewContainer.style.display = 'none';
            fileUploadLabel.style.display = 'flex';
            imagePreview.src = '';
            if (imageInput) imageInput.value = '';
        }

        function clearErrors() {
            modalOverlay.querySelectorAll('.error-msg').forEach(el => el.textContent = '');
            modalOverlay.querySelectorAll('.form-group input').forEach(el => el.classList.remove('invalid'));
        }

        if (addCardBtn) {
            addCardBtn.addEventListener('click', openModal);
        }

        closeBtns.forEach(btn => btn.addEventListener('click', closeModal));

        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });

        // Handle image selection preview
        imageInput.addEventListener('change', function(e) {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    imagePreview.src = event.target.result;
                    imagePreviewContainer.style.display = 'block';
                    fileUploadLabel.style.display = 'none';
                };
                reader.readAsDataURL(this.files[0]);
            }
        });

        // Handle image removal
        removeImageBtn.addEventListener('click', function() {
            resetImagePreview();
        });

        // Form Validation and Submission
        addItemForm.addEventListener('submit', (e) => {
            e.preventDefault();
            clearErrors();

            const nameInput = document.getElementById('item-name');
            const priceInput = document.getElementById('item-price');

            let isValid = true;

            if (!nameInput.value.trim()) {
                document.getElementById('name-error').textContent = 'Item name is required.';
                nameInput.classList.add('invalid');
                isValid = false;
            }

            const price = parseFloat(priceInput.value);
            if (!priceInput.value || isNaN(price) || price <= 0) {
                document.getElementById('price-error').textContent = 'Enter a valid positive price.';
                priceInput.classList.add('invalid');
                isValid = false;
            }

            if (!imageInput.files || imageInput.files.length === 0) {
                if (!currentEditCard) { // Image is only required if adding a new item
                    document.getElementById('image-error').textContent = 'Image file is required.';
                    imageInput.classList.add('invalid');
                    isValid = false;
                }
            }

            if (isValid) {
                const finishSubmit = (finalImageUrl) => {
                    if (currentEditCard) {
                        const oldName = currentEditCard.dataset.name;
                        
                        // Update DOM
                        currentEditCard.dataset.name = nameInput.value.trim();
                        currentEditCard.dataset.price = price;
                        currentEditCard.dataset.imageUrl = finalImageUrl;
                        
                        currentEditCard.querySelector('.item-img').src = finalImageUrl;
                        currentEditCard.querySelector('.item-img').alt = nameInput.value.trim();
                        currentEditCard.querySelector('.item-name-text').textContent = nameInput.value.trim();
                        currentEditCard.querySelector('.item-price-tag').innerHTML = `<span class="real-currency">$</span>${price.toFixed(2)}`;
                        
                        updateItemInStorage(oldName, nameInput.value.trim(), price, finalImageUrl);
                    } else {
                        addNewCard(nameInput.value.trim(), price, finalImageUrl, true);
                    }
                    closeModal();
                };

                if (imageInput.files && imageInput.files.length > 0) {
                    const file = imageInput.files[0];
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        finishSubmit(event.target.result);
                    };
                    reader.readAsDataURL(file);
                } else if (currentEditCard) {
                    // Editing, but no new image selected. Keep old image.
                    finishSubmit(currentEditCard.dataset.imageUrl);
                }
            }
        });
    }
});
