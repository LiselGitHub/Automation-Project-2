import { faker } from '@faker-js/faker';

// Variables and functions

const randomTitle = faker.lorem.word();
const randomDescription = faker.lorem.words(5);
const initialEstimateTime = 10;
const editEstimateTime = 20;
const timeSpent = 2;
const timeRemaining = 5;
const submitButton = 'button[type="submit"]';

function selectReporterBabyYoda() {
  cy.get('[data-testid="select:reporterId"]').click();
  cy.get('[data-testid="select-option:Baby Yoda"]').click();
}

function createNewIssue(randomTitle, randomDescription) {
  cy.visit('/');
  cy.url()
    .should('eq', `${Cypress.env('baseUrl')}project/board`)
    .then((url) => {
      cy.visit(url + '/board?modal-issue-create=true');

      cy.get('[data-testid="modal:issue-create"]').within(() => {
        cy.get('.ql-editor').type(randomDescription);
        cy.get('.ql-editor').should('have.text', randomDescription);

        cy.get('input[name="title"]').type(randomTitle);
        cy.get('input[name="title"]').should('have.value', randomTitle);

        selectReporterBabyYoda();

        cy.get('[data-testid="form-field:userIds"]').click();
        cy.get('[data-testid="select-option:Lord Gaben"]').click();

        cy.get('[data-testid="select:priority"]').click();
        cy.get('[data-testid="select-option:Low"]').click();

        cy.get(submitButton).click();
      });

      cy.get('[data-testid="modal:issue-create"]').should('not.exist');
      cy.contains('Issue has been successfully created.').should('be.visible');

      cy.reload();
      cy.contains('Issue has been successfully created.').should('not.exist');

      cy.contains(randomTitle).click();
    });
}

describe('Time Estimation - Add, Edit, Delete, Time Logging - Add, Delete', () => {
  beforeEach(() => {
    createNewIssue(randomTitle, randomDescription);
  });

  // Time Estimation

  it('Should add, edit and remove the time estimate successfully', () => {
    cy.get('[data-testid="modal:issue-details"]').within(() => {
      cy.get('input[placeholder="Number"]').type(initialEstimateTime);

      cy.contains(`${initialEstimateTime}${'h estimated'}`).should(
        'be.visible'
      );
    });

    cy.get('[data-testid="icon:close"]').first().click();

    cy.get('[data-testid="list-issue"]');
    cy.contains(randomTitle).click();

    cy.get('[data-testid="modal:issue-details"]').within(() => {
      cy.get('input[placeholder="Number"]').clear().type(editEstimateTime);

      cy.contains(`${editEstimateTime}${'h estimated'}`).should('be.visible');
    });

    cy.get('[data-testid="icon:close"]').first().click();

    cy.get('[data-testid="list-issue"]');
    cy.contains(randomTitle).click();

    cy.get('[data-testid="modal:issue-details"]').within(() => {
      cy.get('input[placeholder="Number"]').clear();

      cy.contains(`${editEstimateTime}${'h estimated'}`).should('not.exist');
    });

    cy.get('[data-testid="icon:close"]').first().click();
  });

  // Time Logging

  it('Should add and remove the time logging successfully', () => {
    cy.get('[data-testid="modal:issue-details"]').within(() => {
      cy.get('input[placeholder="Number"]').type(initialEstimateTime);

      cy.get('[data-testid="icon:stopwatch"]').click();
    });

    cy.get('[data-testid="modal:tracking"]')
      .should('be.visible')
      .within(() => {
        cy.get('input[placeholder="Number"]').eq(0).type(timeSpent);
        cy.get('input[placeholder="Number"]').eq(1).type(timeRemaining);
        cy.contains('button', 'Done').click();
      });

    cy.get('[data-testid="modal:issue-details"]').should('be.visible');
    cy.contains('No time logged').should('not.exist');
    cy.contains(`${timeSpent}${'h logged'}`).should('be.visible');
    cy.contains(`${timeRemaining}${'h remaining'}`).should('be.visible');

    cy.get('[data-testid="icon:close"]').first().click();

    cy.get('[data-testid="list-issue"]');
    cy.contains(randomTitle).click();

    cy.get('[data-testid="icon:stopwatch"]').click();
    cy.get('[data-testid="modal:tracking"]')
      .should('be.visible')
      .within(() => {
        cy.get('input[placeholder="Number"]').eq(0).clear();
        cy.get('input[placeholder="Number"]').eq(1).clear();

        cy.contains('button', 'Done').click();
        cy.wait(1000);
      });

    cy.get('[data-testid="modal:issue-details"]').should('be.visible');

    cy.contains('No time logged').should('be.visible');
    cy.contains(`${timeSpent}${'h logged'}`).should('not.exist');
    cy.contains(`${timeRemaining}${'h remaining'}`).should('not.exist');
    cy.contains(`${initialEstimateTime}${'h estimated'}`).should('be.visible');
  });
});
