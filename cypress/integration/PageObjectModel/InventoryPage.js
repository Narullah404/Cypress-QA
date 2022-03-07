class InventoryPage {

	getAllInventoryItems() {
		cy.get('div.inventory_list').as('items')
		return this
	}

	getItemName(item_number, alias_name) {
		cy.get('@items').get('div.inventory_item_name').eq(item_number).invoke('text').as(alias_name)
		return this
	}

	getItemPrice(item_number, alias_name) {
		cy.get('@items').get('div.pricebar .inventory_item_price').eq(0).invoke('text').as('item_one_price')
		return this
	}

	addItemToCart(item_number) {
		cy.get('@items').get('div.pricebar .inventory_item_price').eq(item_number).get('button.btn_inventory').eq(item_number).click()
		return this
	}

	clickShoppingCart() {
		cy.get('a.shopping_cart_link').parent().click()
		return this
	}

	returnToInventoryPage() {
		cy.get('div.bm-burger-button').click()
		cy.get('a[id="inventory_sidebar_link"]').click()
		return this
	}

	clickLogout() {
		cy.get('div.bm-burger-button').click()
		cy.get('a[id="logout_sidebar_link"]').click()
		return this
	}
}

export default InventoryPage