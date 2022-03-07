/// <reference types="cypress" />

// import code from Login, inventory and Cart pages 
import LoginPage from "../PageObjectModel/LoginPage"
import InventoryPage from "../PageObjectModel/InventoryPage"
import CartPage from '../PageObjectModel/CartPage'

context('Web automation', () => {
  let users;
  
  beforeEach(() => {
    cy.visit('https://www.saucedemo.com/')
    cy.fixture('login').then( function(user) {
    	users = user
    	return users
    })
  })
	
	it('Multiple tests:', () => {

		// initialise 
		const login = new LoginPage();
		const inventory = new InventoryPage();
		const cart = new CartPage()

		/************************** TEST ONE **************************************/
		// grab standard_user_login and password from environmentialised login file
		const standard_user = users.find(u => u.id == 1).username;
		const password = users.find(u => u.id == 1).password;

		login.LoginUser(standard_user, password)

		// assert we successfully loged in 
		cy.url().should('eq', 'https://www.saucedemo.com/inventory.html')

		/*************************************************************************/


		/**************************** TEST 2 and 3 *********************************************/
		// grab div from DOM which contains all of items information
		inventory.getAllInventoryItems()
		
		// grab Item name and price to be used later
		inventory.getItemName(0, 'item_one_name')
		inventory.getItemPrice(0, 'item_one_price')
		
		// add item to cart
		inventory.addItemToCart(0)		
		
		inventory.clickShoppingCart()

		// Assert Item name matches with what is in cart
		cy.get('div.cart_list .cart_item .inventory_item_name').invoke('text').then((actual) => {
			cy.get('@item_one_name').should('eq', String(actual))
		})

		// Assert Item price matches with what is in cart
		cy.get('div.cart_list .cart_item .inventory_item_price').invoke('text').then((actual) => {
			cy.get('@item_one_price').should('eq', String(actual))
		})
		/**********************************************************************************/

		/**************************** TEST 4 *********************************************/
		
		inventory.returnToInventoryPage()
		// add one more item to cart
		inventory.addItemToCart(1)
		inventory.clickShoppingCart()

		// Assert total_price from cart equals total sum for the two items
		var total_price = 0;
		cy.get('div.item_pricebar .inventory_item_price').each( (value) => {
			let price = value.text().trim().replace('$', '')
			total_price += parseFloat(price)
		}).then( () => {
			cart.clickCheckout()
			cart.fillCheckoutInformation()

			cy.get('div.summary_info .summary_subtotal_label').invoke('text').then( (text) => {
				cy.wrap(text).should('eq', 'Item total: $' + total_price)
			})
		})
		/**********************************************************************************/

		/******************************* TEST 5 *******************************************/
		// logout 
		inventory.clickLogout()
		
		// grab login credentials for locked_out_user
		const locked_out_user = users.find(u => u.id == 2).username
		const locked_out_user_password = users.find(u => u.id == 2).password
		
		// sign in
		login.LoginUser(locked_out_user, locked_out_user_password)
		
		// Assert we get correct error message		
		cy.get('button').should('have.class', 'error-button').then( () => {
			cy.get('h3[data-test="error"]').invoke('text').as('errorMessage')
			cy.get('@errorMessage').should('eq', 'Epic sadface: Sorry, this user has been locked out.')
		})
		/**********************************************************************************/		
	})
})

context('Bonus points', () => {

	let users;

	beforeEach(() => {

		cy.visit('https://www.saucedemo.com/')
		cy.fixture('login').then( function(user) {
			users = user
			return users
		})
	})

	it('successfully login as a problem user', () => {

		// initalise login as we need LoginUser method
		const login = new LoginPage();
		
		// Grab problem_user credentials and login
		const problem_user = users.find(u => u.id == 3).username;
		const password = users.find(u => u.id == 3).password;
		login.LoginUser(problem_user, password)
		
		// Assert we have successfully logged in
		cy.url().should('eq', 'https://www.saucedemo.com/inventory.html')
	})

	it('Problem #1: User cannot proceed to checkout if no items in basket', () => {

		// initialise 
		const login = new LoginPage();
		const inventory = new InventoryPage();
		const cart = new CartPage()

		// Grab standard_user credentials and login
		const standard_user = users.find(u => u.id == 1).username;
		const password = users.find(u => u.id == 1).password;
		login.LoginUser(standard_user, password)

		inventory.clickShoppingCart()

		// Assert we should error message and not be allowed to progress part cart page
		cy.get('div.cart_item').should('not.exist').then( () => {
			cart.clickCheckout()
			cy.url().should('eq', 'https://www.saucedemo.com/cart.html')
			cy.contains('Error: no items in basket')	
		})
	})

	it('Problem #2: user buys Backpack, Bike Light, Bolt T-shirt, Fleece Jacket. Item total should be correct', () => {
		
		// initialise 
		const login = new LoginPage();
		const inventory = new InventoryPage();
		const cart = new CartPage()

		// Grab standard_user credentials and login
		const standard_user = users.find(u => u.id == 1).username;
		let password = users.find(u => u.id == 1).password;
		login.LoginUser(standard_user, password)

		// Adding 4 items to the cart
		inventory.getAllInventoryItems()
		inventory.addItemToCart(0)
		inventory.addItemToCart(1)
		inventory.addItemToCart(2)
		inventory.addItemToCart(3)

		// proceeding to checkout
		inventory.clickShoppingCart()
		cart.clickCheckout()

		// fill out name, surname and ZIP code on checkout page
		cart.fillCheckoutInformation()
	
		// Assert total price matches with total on cart page
		cy.get('div.summary_info .summary_subtotal_label').invoke('text').then( (text) => {
				cy.wrap(text).should('eq', 'Item total: $' + String(105.96))
		})
	})

	it('Problem #3: User selects item, when new user logins basket should be empty', () => {

		// initialise
		const login = new LoginPage();
		const inventory = new InventoryPage();
		const cart = new CartPage()

		// Grab standard_user credentials and login
		const standard_user = users.find(u => u.id == 1).username;
		let password = users.find(u => u.id == 1).password;
		login.LoginUser(standard_user, password)

		// Add single item to cart
		inventory.getAllInventoryItems()
		inventory.addItemToCart(0)

		// logout 
		inventory.clickLogout()

		// login as new user, problem_user
		const problem_user = users.find(u => u.id == 3).username;
		password = users.find(u => u.id == 3).password;
		login.LoginUser(problem_user, password)

		// wait for Shopping cart icon to appear
		cy.wait(500)
		inventory.clickShoppingCart()

		// Assert div cart_item is not present and not have cart info, as user should not be able to see standard_user selected items
		cy.get('div.cart_list').find('div').should('have.length', 2)
		cy.get('div.cart_item').should('not.exist')
	})
})