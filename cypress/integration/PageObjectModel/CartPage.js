class CartPage {

	clickCheckout() {
		cy.get('button[data-test="checkout"]').click()
		return this
	}

	fillCheckoutInformation() {
		cy.get('input[data-test="firstName"]').clear().type('John')
		cy.get('input[data-test="lastName"]').clear().type('Doe')
		cy.get('input[data-test="postalCode"]').clear().type('washington')
		cy.get('input[data-test="continue"]').click()
		return this
	}
}
export default CartPage