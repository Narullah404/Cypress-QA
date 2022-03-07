class LoginPage {

	LoginUser(username, password) {
		cy.get('input[name="user-name"]').clear().type(username)
		cy.get('input[name="password"]').clear().type(password)
		cy.get('input[id="login-button"]').click()
		return this
	}
}

export default LoginPage