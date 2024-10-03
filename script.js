// Select elements
const addToCartButtons = document.querySelectorAll('.add-to-cart');
const emptyCartElement = document.querySelector('.empty-cart'); // Empty cart image and message
const cartItemsContainer = document.querySelector('.cart-items-container'); // Container for all cart items
const cartHeader = document.querySelector('.cartheader .quantity');
const totalPriceElement = document.querySelector('.Total-Price');
const totalElement = document.querySelector('.total'); // Total price container
const infoElement = document.querySelector('.info'); // Carbon neutral info
const confirmButton = document.querySelector('.button-confirm'); // Confirm order button

let totalCartPrice = 0; // Initialize the total cart price

// Load cart from localStorage on page load
document.addEventListener('DOMContentLoaded', function () {
    loadCartFromStorage();
});

// Loop over all "Add to Cart" buttons and assign event listeners
addToCartButtons.forEach(button => {
    button.addEventListener('click', function (event) {
        const productBox = event.target.closest('.box'); // Get the closest product box
        const productName = productBox.querySelector('.name').textContent;
        const productPrice = parseFloat(productBox.querySelector('.price').textContent.replace('$', ''));
        const incrementDecrementDiv = productBox.querySelector('.increment-dicrement');
        const numberSpan = incrementDecrementDiv.querySelector('.number');

        let currentNumber = parseInt(numberSpan.textContent);

        // Hide the "Add to Cart" button and show the increment-decrement div
        button.style.display = 'none';
        incrementDecrementDiv.style.display = 'flex';

        // Add the item to the cart
        addItemToCart(productName, currentNumber, productPrice);

        // Set up increment and decrement button logic
        const decrementButton = incrementDecrementDiv.querySelector('.decrement');
        const incrementButton = incrementDecrementDiv.querySelector('.increment');

        decrementButton.addEventListener('click', function () {
            if (currentNumber > 1) {
                currentNumber--;
                numberSpan.textContent = currentNumber;
                updateCartItem(productName, currentNumber, productPrice);
            }
        });

        incrementButton.addEventListener('click', function () {
            currentNumber++;
            numberSpan.textContent = currentNumber;
            updateCartItem(productName, currentNumber, productPrice);
        });
    });
});

// Function to add an item to the cart
// Function to add an item to the cart
function addItemToCart(name, quantity, price) {
    // Check if the item already exists in the cart
    const existingCartItem = Array.from(document.querySelectorAll('.cart-item')).find(item =>
        item.querySelector('.item-name').textContent === name
    );

    if (existingCartItem) {
        // If the item already exists, update the quantity
        const existingQuantity = parseInt(existingCartItem.querySelector('.numberofitem').textContent);
        const newQuantity = existingQuantity + quantity;
        existingCartItem.querySelector('.numberofitem').textContent = `${newQuantity}x`;
        existingCartItem.querySelector('.item-pricexnumberofitems').textContent = `$${(newQuantity * price).toFixed(2)}`;

        // Update the total cart price
        totalCartPrice += quantity * price;
        totalPriceElement.textContent = `$${totalCartPrice.toFixed(2)}`;

        // Save updated cart to localStorage
        saveCartToStorage();

        return; // Exit the function since the item is already in the cart
    }

    // Hide the empty cart image and show the cart details
    emptyCartElement.style.display = 'none';
    cartItemsContainer.style.display = 'block';
    totalElement.style.display = 'flex';
    infoElement.style.display = 'block';
    confirmButton.style.display = 'block';

    // Create a cart item div
    const cartItem = document.createElement('div');
    cartItem.classList.add('cart-item');

    const itemInfo = `
        <div class="item-info">
            <span class="item-name">${name}</span>
            <div class="downinfo">
                <span class="numberofitem">${quantity}x</span>
                <div>
                    <span class="item-price">@ $${price.toFixed(2)}</span>
                    <span class="item-pricexnumberofitems">$${(quantity * price).toFixed(2)}</span>
                </div>
            </div>
        </div>
        <div class="delete">
            <img class="img-delete" src="assets/images/icon-remove-item.svg" alt="Delete item">
        </div>
    `;

    cartItem.innerHTML = itemInfo;

    // Append the new item to the cartItemsContainer
    cartItemsContainer.appendChild(cartItem);

    // Update total cart price
    totalCartPrice += quantity * price;
    totalPriceElement.textContent = `$${totalCartPrice.toFixed(2)}`;

    // Update cart item count in the header
    updateCartCount();

    // Save cart to localStorage
    saveCartToStorage();

    // Add event listener for delete button
    const deleteButton = cartItem.querySelector('.img-delete');
    deleteButton.addEventListener('click', function () {
        removeItemFromCart(cartItem, quantity, price);
    });
}


// Function to update the number of items in the cart header
function updateCartCount() {
    const cartItems = document.querySelectorAll('.cart-item');
    cartHeader.textContent = `(${cartItems.length})`;
}

// Function to remove an item from the cart
function removeItemFromCart(cartItem, quantity, price) {
    // Remove the item from the DOM
    cartItem.remove();

    // Update the total cart price after removing the item
    totalCartPrice -= quantity * price;

    // Recalculate the total price for the remaining items
    recalculateTotalPrice();

    // Update cart item count in the header
    updateCartCount();

    // Save updated cart to localStorage
    saveCartToStorage();

    // If there are no items left, show the empty cart message
    if (document.querySelectorAll('.cart-item').length === 0) {
        emptyCartElement.style.display = 'block';
        cartItemsContainer.style.display = 'none';
        totalElement.style.display = 'none';
        infoElement.style.display = 'none';
        confirmButton.style.display = 'none';
    }
}

// Function to update cart item quantity and price based on current number
function updateCartItem(name, quantity, price) {
    const cartItem = Array.from(document.querySelectorAll('.cart-item')).find(item =>
        item.querySelector('.item-name').textContent === name
    );
    
    if (cartItem) {
        // Update the quantity and price display for the cart item
        cartItem.querySelector('.numberofitem').textContent = `${quantity}x`;
        cartItem.querySelector('.item-pricexnumberofitems').textContent = `$${(quantity * price).toFixed(2)}`;

        // Recalculate the total price for all items
        recalculateTotalPrice();

        // Save updated cart to localStorage
        saveCartToStorage();
    }
}

// Function to recalculate the total price for all items in the cart
function recalculateTotalPrice() {
    totalCartPrice = 0; // Reset total cart price

    // Loop through all cart items and recalculate the total
    document.querySelectorAll('.cart-item').forEach(item => {
        const itemQuantity = parseInt(item.querySelector('.numberofitem').textContent);
        const itemPrice = parseFloat(item.querySelector('.item-price').textContent.replace('@ $', ''));
        totalCartPrice += itemQuantity * itemPrice;
    });

    // Update the total price element with the recalculated total
    totalPriceElement.textContent = `$${totalCartPrice.toFixed(2)}`;
}

// Function to save the cart to localStorage
function saveCartToStorage() {
    const cartItems = [];

    // Loop through all cart items and store them in an array
    document.querySelectorAll('.cart-item').forEach(item => {
        const itemName = item.querySelector('.item-name').textContent;
        const itemQuantity = parseInt(item.querySelector('.numberofitem').textContent);
        const itemPrice = parseFloat(item.querySelector('.item-price').textContent.replace('@ $', ''));
        cartItems.push({ name: itemName, quantity: itemQuantity, price: itemPrice });
    });

    // Save cart data as a JSON string to localStorage
    localStorage.setItem('cart', JSON.stringify(cartItems));
    localStorage.setItem('totalPrice', totalCartPrice.toFixed(2));
}

// Function to load the cart from localStorage
function loadCartFromStorage() {
    const savedCart = localStorage.getItem('cart');
    const savedTotalPrice = localStorage.getItem('totalPrice');

    if (savedCart && savedCart !== '[]' && savedTotalPrice) {
        const cartItems = JSON.parse(savedCart);

        // Loop through saved items and add them back to the cart
        cartItems.forEach(item => {
            addItemToCart(item.name, item.quantity, item.price);
        });

        // Update the total price
        totalCartPrice = parseFloat(savedTotalPrice);
        totalPriceElement.textContent = `$${totalCartPrice.toFixed(2)}`;

        // Show the cart details
        emptyCartElement.style.display = 'none';
        cartItemsContainer.style.display = 'block';
        totalElement.style.display = 'flex';
        infoElement.style.display = 'block';
        confirmButton.style.display = 'block';
    } else {
        // If the cart is empty, show the empty cart message
        emptyCartElement.style.display = 'block';
        cartItemsContainer.style.display = 'none';
        totalElement.style.display = 'none';
        infoElement.style.display = 'none';
        confirmButton.style.display = 'none';
    }
}



// Select the confirm order button
const confirmOrderButton = document.querySelector('.button-confirm button');
// Select the confirmation box wrapper
const confirmationBox = document.querySelector('.outside');
// Select the container where cart items will be displayed in the confirmation box
const confirmationDetailsContainer = document.querySelector('.confirmation-details');
// Select the element where the total price will be displayed in the confirmation box
const confirmationTotalPriceElement = document.querySelector('.totalp');

// Add event listener for the confirm button
confirmOrderButton.addEventListener('click', function () {
    // First, clear the existing items in the confirmation box to avoid duplication
    confirmationDetailsContainer.innerHTML = '';

    // Get the cart items from the cart items container
    const cartItems = document.querySelectorAll('.cart-item');

    // Loop through the cart items and add them to the confirmation box
    cartItems.forEach(item => {
        const itemName = item.querySelector('.item-name').textContent;
        const itemQuantity = item.querySelector('.numberofitem').textContent;
        const itemPrice = item.querySelector('.item-price').textContent;
        const totalPrice = item.querySelector('.item-pricexnumberofitems').textContent;

        // Create a new item div for the confirmation box
        const confirmationItemDiv = document.createElement('div');
        confirmationItemDiv.classList.add('confirmation-details');

        confirmationItemDiv.innerHTML = `
            <div class="item-img">
                <img src="assets/images/image-baklava-mobile.jpg" alt="${itemName}">
            </div>
            <div class="item-info">
                <div class="left-info">
                    <span class="itemname">${itemName}</span>
                    <div class="div-top">
                        <span class="numberofitems">${itemQuantity}</span>
                        <span class="itemprice">${itemPrice}</span>
                    </div>
                </div>
                <span class="priceperitem">${totalPrice}</span>
            </div>
        `;

        // Append the item to the confirmation details container
        confirmationDetailsContainer.appendChild(confirmationItemDiv);
    });

    // Update the total price in the confirmation box
    const cartTotalPrice = document.querySelector('.Total-Price').textContent;
    confirmationTotalPriceElement.textContent = cartTotalPrice;

    // Show the confirmation box
    confirmationBox.style.display = 'flex';
});


// Select the "Start new order" button
const startNewOrderButton = document.querySelector('.downbtn');

// Add event listener for "Start new order" button
startNewOrderButton.addEventListener('click', function() {
    // Clear all cart items from the container
    cartItemsContainer.innerHTML = '';

    // Reset the total cart price to 0
    totalCartPrice = 0;
    totalPriceElement.textContent = `$${totalCartPrice.toFixed(2)}`;

    // Clear the cart count in the header
    updateCartCount();

    // Show the empty cart message and hide the cart items container, total, info, and confirm button
    emptyCartElement.style.display = 'block';
    cartItemsContainer.style.display = 'none';
    totalElement.style.display = 'none';
    infoElement.style.display = 'none';
    confirmButton.style.display = 'none';

    // Clear the confirmation box
    confirmationDetailsContainer.innerHTML = '';
    
    // Hide the confirmation box
    confirmationBox.style.display = 'none';

    // Clear cart data from localStorage
    localStorage.removeItem('cart');
    localStorage.removeItem('totalPrice');
});
