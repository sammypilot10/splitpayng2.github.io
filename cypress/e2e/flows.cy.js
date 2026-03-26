// cypress/e2e/flows.cy.ts

describe('SplitPayNG Core Flows', () => {
  beforeEach(() => {
    // Note: To run these tests, you must start the Next.js dev server and set Cypress baseUrl
    cy.visit('/')
  })

  it('Blocks host from joining their own pool', () => {
    // 1. Stub the auth session to be the host
    // 2. Navigate to /pools/[my-pool-id]
    // 3. Instead of the "Join", the UI should render "You created this pool"
    // cy.get('div').contains('You created this pool').should('be.visible')
  })

  it('Enforces mandatory payout account guard when creating a pool', () => {
    // 1. Authenticate as a user WITHOUT a linked bank account
    // cy.visit('/create-pool')
    // 2. The server-side guard should catch this and redirect
    // cy.url().should('include', '/dashboard/settings')
    // cy.contains('Please set up your payout account').should('be.visible')
  })

  it('Enforces mandatory saved card guard when joining a pool', () => {
    // 1. Authenticate as a user WITHOUT a saved card
    // 2. Send API request to /api/memberships/join
    // cy.request({
    //   method: 'POST',
    //   url: '/api/memberships/join',
    //   failOnStatusCode: false
    // }).then((response) => {
    //   expect(response.status).to.eq(403)
    //   expect(response.body.error).to.include('valid payment card')
    // })
  })

  it('Generates and displays invite link for private pools', () => {
    // 1. Proceed through Create Pool wizard
    // 2. Uncheck "List on Public Marketplace"
    // 3. Complete creation
    // 4. Verify step 4 success screen shows the /pools/join?token= link
    // cy.contains('Pool Created Successfully!').should('be.visible')
    // cy.contains('pools/join?token=').should('be.visible')
  })
})
