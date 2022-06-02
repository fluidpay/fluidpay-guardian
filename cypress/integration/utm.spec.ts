const sessionId = 'aksdjakslfjsa';

before(() => {
    cy.intercept('**/api/guardian/session', {
        data: {
            session_id: sessionId
        }
    });
});

describe('Check UTM param detection and values', () => {
    it('Navigate to UTM page', () => {
        cy.visit('/');

        cy.contains('UTM').click();

        cy.location('pathname', { timeout: 10000 }).should('include', '/utm');

        cy.get('h1').contains('UTM params');
    });
    it('Waits until event details loaded', () => {
        pressRefreshAndWait();
        cy.get('div.event-details div', { timeout: 10000 });
    });
    it('Check the detected utm params', () => {
        pressRefreshAndWait();
        cy.get('.utm_source_detected > div > h2').contains('utm_source_detected');
        cy.get('.utm_source_detected .utm_source_detected_value').contains('buffer');

        pressRefreshAndWait();
        cy.get('.utm_medium_detected > div > h2').contains('utm_medium_detected');
        cy.get('.utm_medium_detected .utm_medium_detected_value').contains('blog');

        pressRefreshAndWait();
        cy.get('.utm_campaign_detected > div > h2').contains('utm_campaign_detected');
        cy.get('.utm_campaign_detected .utm_campaign_detected_value').contains(
            '2-social-strategies'
        );

        pressRefreshAndWait();
        cy.get('.utm_term_detected > div > h2').contains('utm_term_detected');
        cy.get('.utm_term_detected .utm_term_detected_value').contains('term1');

        pressRefreshAndWait();
        cy.get('.utm_content_detected > div > h2').contains('utm_content_detected');
        cy.get('.utm_content_detected .utm_content_detected_value').contains('blogpost');
    });
});

function pressRefreshAndWait() {
    cy.get('.refresh-events', { timeout: 10000 }).click();
    cy.get('div.event-details .progress-events', { timeout: 10000 }).should('not.exist');
}
