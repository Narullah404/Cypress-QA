/// <reference types="cypress" />

context('API: POST', () => {

	it('Create new user, empty parameters should result in correct response body property error', () => {

		cy.request({
			method: 'POST',
			url: 'https://reqres.in/api/users',
			body: {
    			'name': '',
    			'job': ''
			}
		}).then( (response) => {
			expect(response.body).to.deep.equal({ "error": "name and/or job cannot be empty"})
		})
	})

	it('Registration should succeed only for existing users', () => {

		cy.request({
			method: 'POST',
			url: 'https://reqres.in/api/register',
			body: {
    			"email": "michael.lawson@reqres.in", // existing user
    			"password": "pistol",
    		}
		}).then( (response) => {
			expect(response.body).to.deep.equal({"id": 7, "token": "QpwL5tke4Pnpja7X7"})
		})

		cy.request({
			method: 'POST',
			url: 'https://reqres.in/api/register',
			failOnStatusCode: false,
			body: {
    			"email": "michaeldsff.lawson@reqres.in", // fake user
    			"password": "pistol",
    		}
		}).then( (response) => {
			expect(response.body.error).to.equal('Note: Only defined users succeed registration')
		})
	})

	it('login should result in error when password is empty', () => {

		cy.request({
			method: 'POST',
			url: 'https://reqres.in/api/login',
			failOnStatusCode: false,
			body: {
    			"email": "michael.lawson@reqres.in",
    			"password": "",
    		}
		}).then( (response) => {
			expect(response.status).to.eq(400)
			expect(response.body.error).to.equal('Missing password')
		})
	})


})


context('API: GET', () => {
	
	it('List all users response code should be 200', () =>{
		cy.request({
			method: 'GET',
			url: 'https://reqres.in/api/users?page=0',
		})
		.then( (response) => {
			expect(response.status).to.eq(200)
		})
	})

	it('Confirm email contains first name, last name and company name', () => {
		cy.request({
			method: 'GET',
			url: 'https://reqres.in/api/users?page=1',
		})
		.then( (response) => {
			var n = response.body.data.length;
			for (var i =0; i < n; i++){
				var first_name = response.body.data[i].first_name.toLowerCase()
				var last_name = response.body.data[i].last_name.toLowerCase()	

				expect(response.body.data[i].email).to.eq(first_name + '.' + last_name + '@reqres.in')
			}
			
		})
	})

	it('Requesting users id more than 12, then response code should be 404', () =>{
		cy.request({
			method: 'GET',
			url: 'https://reqres.in/api/users/13',
			failOnStatusCode: false,
		})
		.then( (response) =>{
			expect(response.status).to.eq(404)
		}) 
	})

})

context('API: PUT', () => {

	it('Update: response code 202, and have correct properties in response body', () => {

		cy.request({
			method: 'PUT',
			url: 'https://reqres.in/api/users/1',
			failOnStatusCode: false,
			body: {
    			"name": "",
    			"job": ""
			}
		})
		.then( (response) =>{
			expect(response.status).to.eq(200)
			expect(response.body).to.have.property('name')
			expect(response.body).to.have.property('job')
			expect(response.body).to.have.property('updatedAt')
		}) 
	})

	it('Update: response code 404, when updating user which does not exist', () => {

		cy.request({
			method: 'PUT',
			url: 'https://reqres.in/api/users/13',
			failOnStatusCode: false,
			body: {
    			"name": "Neo",
    			"job": "The one"
			}
		})
		.then( (response) =>{
			expect(response.status).to.eq(404)
		}) 
	})

	it('Update: response code 404, when sending empty parameters in body', () => {

		cy.request({
			method: 'PUT',
			url: 'https://reqres.in/api/users/1',
			failOnStatusCode: false,
			body: {}
		})
		.then( (response) =>{
			expect(response.status).to.eq(404)
		}) 
	})

})

context('API: DELETE', () => {

	it('Delete a user should result in correct response 202: no response', () => {

		cy.request({
			method: 'DELETE',
			url: 'https://reqres.in/api/users/1',
		})
		.then( (response) =>{
			expect(response.status).to.eq(204)
			expect(response.body).to.be.empty
		})
	})

	it('Delete user which does not exist should error', () => {
		cy.request({
			method: 'DELETE',
			url: 'https://reqres.in/api/users/13',
			failOnStatusCode: false,
		})
		.then( (response) =>{
			expect(response.status).to.eq(404)
		})
	})

})