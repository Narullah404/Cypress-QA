/// <reference types="cypress" />

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

		const login = new LoginPage();
		const inventory = new InventoryPage();
		const cart = new CartPage()

		/************************** TEST ONE **************************************/
		const standard_user = users.find(u => u.id == 1).username;
		const password = users.find(u => u.id == 1).password;
		login.LoginUser(standard_user, password)
		// assert we successfully loged in 
		cy.url().should('eq', 'https://www.saucedemo.com/inventory.html')

		/*************************************************************************/


		/**************************** TEST 2/3 *********************************************/
		inventory.getAllInventoryItems()
		
		inventory.getItemName(0, 'item_one_name')
		inventory.getItemPrice(0, 'item_one_price')
		
		inventory.addItemToCart(0)		
		
		inventory.clickShoppingCart()

		cy.get('div.cart_list .cart_item .inventory_item_name').invoke('text').then((actual) => {
			cy.get('@item_one_name').should('eq', String(actual))
		})

		cy.get('div.cart_list .cart_item .inventory_item_price').invoke('text').then((actual) => {
			cy.get('@item_one_price').should('eq', String(actual))
		})
		/**********************************************************************************/

		/**************************** TEST 4 *********************************************/
		inventory.returnToInventoryPage()
		inventory.addItemToCart(1)
		inventory.clickShoppingCart()

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
		inventory.clickLogout()

		const locked_out_user = users.find(u => u.id == 2).username
		const locked_out_user_password = users.find(u => u.id == 2).password

		login.LoginUser(locked_out_user, locked_out_user_password)
				
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

		const login = new LoginPage();

		const problem_user = users.find(u => u.id == 3).username;
		const password = users.find(u => u.id == 3).password;
		login.LoginUser(problem_user, password)
		
		cy.url().should('eq', 'https://www.saucedemo.com/inventory.html')
	})

	it('Problem #1: User cannot proceed to checkout if no items in basket', () => {

		const login = new LoginPage();
		const inventory = new InventoryPage();
		const cart = new CartPage()


		const standard_user = users.find(u => u.id == 1).username;
		const password = users.find(u => u.id == 1).password;
		login.LoginUser(standard_user, password)

		inventory.clickShoppingCart()

		cy.get('div.cart_item').should('not.exist').then( () => {
			cart.clickCheckout()
			cy.url().should('eq', 'https://www.saucedemo.com/cart.html')
			cy.contains('Error: no items in basket')	
		})
	})

	it('Problem #2: user buys Backpack, Bike Light, Bolt T-shirt, Fleece Jacket. Item total should be correct', () => {

		const login = new LoginPage();
		const inventory = new InventoryPage();
		const cart = new CartPage()

		const standard_user = users.find(u => u.id == 1).username;
		let password = users.find(u => u.id == 1).password;
		login.LoginUser(standard_user, password)

		inventory.getAllInventoryItems()
		inventory.addItemToCart(0)
		inventory.addItemToCart(1)
		inventory.addItemToCart(2)
		inventory.addItemToCart(3)

		inventory.clickShoppingCart()
		cart.clickCheckout()

		cart.fillCheckoutInformation()

		cy.get('div.summary_info .summary_subtotal_label').invoke('text').then( (text) => {
				cy.wrap(text).should('eq', 'Item total: $' + String(105.96))
		})
	})

	it('Problem #3: User selects item, when new user logins basket should be empty', () => {

		const login = new LoginPage();
		const inventory = new InventoryPage();
		const cart = new CartPage()

		const standard_user = users.find(u => u.id == 1).username;
		let password = users.find(u => u.id == 1).password;
		login.LoginUser(standard_user, password)

		inventory.getAllInventoryItems()
		inventory.addItemToCart(0)

		inventory.clickLogout()

		const problem_user = users.find(u => u.id == 3).username;
		password = users.find(u => u.id == 3).password;
		login.LoginUser(problem_user, password)

		cy.wait(500)
		inventory.clickShoppingCart()
		cy.get('div.cart_list').find('div').should('have.length', 2)
		cy.get('div.cart_item').should('not.exist')
	})
})