import { faker } from '@faker-js/faker';

// Variables and functions

const getIssueDetailsModal = () =>
  cy.get('[data-testid="modal:issue-details"]');

let previousComment = faker.word.words(3);
const comment = faker.word.words(10);

function createComment(text) {
  getIssueDetailsModal().within(() => {
    cy.contains('Add a comment...').click();

    cy.get('textarea[placeholder="Add a comment..."]').type(text);

    cy.contains('button', 'Save').click().should('not.exist');

    cy.contains('Add a comment...').should('exist');
    cy.get('[data-testid="issue-comment"]').should('contain', text);
  });
}

function editComment(oldText, newText) {
  getIssueDetailsModal().within(() => {
    cy.get('[data-testid="issue-comment"]')
      .contains(oldText)
      .parents('[data-testid="issue-comment"]')
      .contains('Edit')
      .click()
      .should('not.exist');

    cy.get('textarea[placeholder="Add a comment..."]').clear().type(newText);

    cy.contains('button', 'Save').click().should('not.exist');

    cy.get('[data-testid="issue-comment"]').should('contain', newText);
  });
}

function deleteComment(text) {
  getIssueDetailsModal().within(() => {
    cy.get('[data-testid="issue-comment"]')
      .contains(text)
      .parents('[data-testid="issue-comment"]')
      .contains('Delete')
      .click();
  });

  cy.get('[data-testid="modal:confirm"]').within(() => {
    cy.contains('button', 'Delete comment').click();
  });

  getIssueDetailsModal().within(() => {
    cy.get('[data-testid="issue-comment"]')
      .find('[data-testid="issue-comment"]')
      .should('not.exist');
  });
}

// Test cases

describe('Issue comments creating, editing and deleting', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.url()
      .should('eq', `${Cypress.env('baseUrl')}project/board`)
      .then((url) => {
        cy.visit(url + '/board');
        cy.contains('This is an issue of type: Task.').click();
      });
  });

  it('Should create a comment successfully', () => {
    getIssueDetailsModal().within(() => {
      cy.contains('Add a comment...').click();

      cy.get('textarea[placeholder="Add a comment..."]').type(comment);

      cy.contains('button', 'Save').click().should('not.exist');

      cy.contains('Add a comment...').should('exist');
      cy.get('[data-testid="issue-comment"]').should('contain', comment);
    });
  });

  it('Should edit a comment successfully', () => {
    previousComment = 'An old silent pond...';

    getIssueDetailsModal().within(() => {
      cy.get('[data-testid="issue-comment"]')
        .first()
        .contains('Edit')
        .click()
        .should('not.exist');

      cy.get('textarea[placeholder="Add a comment..."]')
        .should('contain', previousComment)
        .clear()
        .type(comment);

      cy.contains('button', 'Save').click().should('not.exist');

      cy.get('[data-testid="issue-comment"]')
        .should('contain', 'Edit')
        .and('contain', comment);
    });
  });

  it('Should delete a comment successfully', () => {
    getIssueDetailsModal()
      .find('[data-testid="issue-comment"]')
      .contains('Delete')
      .click();

    cy.get('[data-testid="modal:confirm"]')
      .contains('button', 'Delete comment')
      .click()
      .should('not.exist');

    getIssueDetailsModal()
      .find('[data-testid="issue-comment"]')
      .should('not.exist');
  });

  // Assingment nr 1

  it('Should create, edit, and delete a comment successfully', () => {
    createComment(comment);

    editComment(comment, previousComment);

    deleteComment(previousComment);
  });
});
